import { BrowserWindow } from 'electron';
import { providers as meta, type ProviderId } from '../../src/lib/ai/providers-meta';
import type { AIMessage } from '../../src/lib/db/schema';
import { getProvider, chatWithCustomEndpoint } from './providers';
import { loadKey } from './keys';
import { loadSettings, recordUsage } from './settings';
import { upsertConversation, getConversation } from './conversations';

export interface ChatRequest {
  userId: number;
  lessonSlug: string;
  systemPrompt: string;
  userMessage: string;
  /** Forzar provider (ignora settings.activeProvider). */
  forceProvider?: ProviderId;
}

export interface FallbackLogEntry {
  provider: ProviderId;
  ok: boolean;
  error?: string;
  ts: number;
}

const fallbackLogs: FallbackLogEntry[] = [];
const MAX_LOGS = 50;

const activeStreams = new Map<string, AbortController>();

export function getFallbackLogs(): FallbackLogEntry[] {
  return [...fallbackLogs];
}

export async function startChat(streamId: string, req: ChatRequest): Promise<void> {
  const settings = loadSettings();
  const primary = req.forceProvider ?? settings.activeProvider;
  const fallback = settings.fallbackEnabled ? settings.fallbackProvider : null;

  const chain: ProviderId[] = [primary];
  if (fallback && fallback !== primary) chain.push(fallback);

  const controller = new AbortController();
  activeStreams.set(streamId, controller);

  // Restaurar historial existente
  const existing = getConversation(req.userId, req.lessonSlug);
  const history: AIMessage[] = [
    { role: 'system', content: req.systemPrompt },
    ...(existing?.messages ?? []).filter((m) => m.role !== 'system'),
    { role: 'user', content: req.userMessage },
  ];

  let assistantText = '';
  let lastError: string | null = null;
  let providerUsed: ProviderId | null = null;
  let modelUsed: string | null = null;

  for (const providerId of chain) {
    const keyEntry = loadKey(providerId);
    if (!keyEntry) {
      logFallback(providerId, false, 'no API key');
      lastError = `${providerId}: no hay API key configurada`;
      continue;
    }

    const model = settings.modelByProvider[providerId] ?? meta[providerId].defaultModel;
    if (!model) {
      logFallback(providerId, false, 'no model');
      continue;
    }

    emit(streamId, { type: 'started', provider: providerId, model });

    let succeeded = true;
    let inputTokens = 0;
    let outputTokens = 0;
    assistantText = '';

    try {
      const stream =
        providerId === 'custom' && keyEntry.customEndpoint
          ? chatWithCustomEndpoint(keyEntry.customEndpoint, keyEntry.key, {
              model,
              messages: history,
              signal: controller.signal,
            })
          : getProvider(providerId).chat(
              { model, messages: history, signal: controller.signal },
              keyEntry.key,
            );

      for await (const ev of stream) {
        if (controller.signal.aborted) {
          emit(streamId, { type: 'aborted' });
          activeStreams.delete(streamId);
          return;
        }
        if (ev.type === 'delta') {
          assistantText += ev.text;
          emit(streamId, { type: 'delta', text: ev.text });
        } else if (ev.type === 'usage') {
          inputTokens = ev.inputTokens;
          outputTokens = ev.outputTokens;
        } else if (ev.type === 'error') {
          succeeded = false;
          lastError = ev.error;
          if (!ev.retryable) {
            emit(streamId, { type: 'error', error: ev.error, status: ev.status });
            activeStreams.delete(streamId);
            return;
          }
          logFallback(providerId, false, ev.error);
          break;
        } else if (ev.type === 'done') {
          break;
        }
      }
    } catch (e) {
      succeeded = false;
      lastError = e instanceof Error ? e.message : 'unknown error';
      logFallback(providerId, false, lastError);
    }

    if (succeeded && assistantText) {
      providerUsed = providerId;
      modelUsed = model;
      recordUsage(req.userId, providerId, {
        requests: 1,
        inputTokens,
        outputTokens,
      });
      logFallback(providerId, true);
      break;
    }
  }

  if (!providerUsed || !modelUsed || !assistantText) {
    emit(streamId, { type: 'error', error: lastError ?? 'todos los providers fallaron' });
    activeStreams.delete(streamId);
    return;
  }

  const newHistory: AIMessage[] = [
    ...history.filter((m) => m.role !== 'system'),
    { role: 'assistant', content: assistantText },
  ];

  upsertConversation(req.userId, req.lessonSlug, providerUsed, modelUsed, newHistory);

  emit(streamId, { type: 'done', provider: providerUsed, model: modelUsed });
  activeStreams.delete(streamId);
}

export function cancelStream(streamId: string): void {
  const ctrl = activeStreams.get(streamId);
  if (ctrl) {
    ctrl.abort();
    activeStreams.delete(streamId);
  }
}

function logFallback(provider: ProviderId, ok: boolean, error?: string): void {
  fallbackLogs.unshift({ provider, ok, error, ts: Date.now() });
  if (fallbackLogs.length > MAX_LOGS) fallbackLogs.length = MAX_LOGS;
}

type StreamPayload =
  | { type: 'started'; provider: ProviderId; model: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; provider: ProviderId; model: string }
  | { type: 'aborted' }
  | { type: 'error'; error: string; status?: number };

function emit(streamId: string, payload: StreamPayload): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(`ai:chunk:${streamId}`, payload);
  }
}
