'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AIChunkPayload, AIPrefs } from '@/types/datapath-api';
import type { ProviderId } from '@/lib/ai/providers-meta';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import { usePreferences } from '@/stores/preferences-store';
import { useGamification } from '@/hooks/use-gamification';

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

interface UseAIChatProps {
  lessonSlug: string;
  lessonTitle?: string;
  lessonExcerpt?: string;
}

function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.datapath !== 'undefined';
}

function newStreamId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAIChat({ lessonSlug, lessonTitle, lessonExcerpt }: UseAIChatProps) {
  const locale = usePreferences((s) => s.locale);
  const { stats } = useGamification();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configuredProviders, setConfiguredProviders] = useState<ProviderId[]>([]);
  const [settings, setSettings] = useState<AIPrefs | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // Cargar conversación + estado de configuración
  const loadAll = useCallback(async () => {
    if (!isElectron()) return;
    const [convo, providers, prefs] = await Promise.all([
      window.datapath.ai.getConversation(lessonSlug),
      window.datapath.ai.configuredProviders(),
      window.datapath.ai.getSettings(),
    ]);
    setConfiguredProviders(providers);
    setSettings(prefs);
    if (convo) {
      setMessages(
        convo.messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
            ts: typeof convo.updatedAt === 'number' ? convo.updatedAt : Date.now(),
          })),
      );
    } else {
      setMessages([]);
    }
  }, [lessonSlug]);

  useEffect(() => {
    // Carga inicial desde IPC (conversación + providers configurados + prefs).
    // El estado vive en el main process; no hay forma de derivarlo en render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [loadAll]);

  const send = useCallback(
    async (userMessage: string) => {
      if (!isElectron() || streaming || !userMessage.trim()) return;
      setError(null);

      const sys = buildSystemPrompt({
        locale,
        level: stats?.level ?? 1,
        rank: stats?.rank ?? 'apprentice',
        lessonTitle,
        lessonExcerpt,
      });

      // Mensaje de usuario optimista + placeholder de assistant.
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMessage, ts: Date.now() },
        { role: 'assistant', content: '', ts: Date.now() },
      ]);
      setStreaming(true);

      const streamId = newStreamId();
      streamIdRef.current = streamId;

      const unsub = window.datapath.ai.onChunk(streamId, (payload: AIChunkPayload) => {
        if (payload.type === 'started') {
          setActiveProvider(payload.provider);
          setActiveModel(payload.model);
        } else if (payload.type === 'delta') {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: last.content + payload.text };
            }
            return next;
          });
        } else if (payload.type === 'done') {
          setStreaming(false);
          unsubRef.current?.();
          streamIdRef.current = null;
        } else if (payload.type === 'aborted') {
          setStreaming(false);
          unsubRef.current?.();
          streamIdRef.current = null;
        } else if (payload.type === 'error') {
          setError(payload.error);
          setStreaming(false);
          unsubRef.current?.();
          streamIdRef.current = null;
          // Mostrar el error como contenido del placeholder vacío
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant' && last.content === '') {
              next[next.length - 1] = {
                ...last,
                content: `_Error: ${payload.error}_`,
              };
            }
            return next;
          });
        }
      });
      unsubRef.current = unsub;

      await window.datapath.ai.startChat({
        streamId,
        lessonSlug,
        systemPrompt: sys,
        userMessage,
      });
    },
    [streaming, locale, lessonSlug, lessonTitle, lessonExcerpt, stats?.level, stats?.rank],
  );

  const stop = useCallback(async () => {
    const sid = streamIdRef.current;
    if (!sid) return;
    await window.datapath.ai.cancelChat(sid);
    setStreaming(false);
  }, []);

  const clear = useCallback(async () => {
    if (!isElectron()) return;
    await window.datapath.ai.clearConversation(lessonSlug);
    setMessages([]);
    setActiveProvider(null);
    setActiveModel(null);
    setError(null);
  }, [lessonSlug]);

  useEffect(() => () => unsubRef.current?.(), []);

  const isConfigured = configuredProviders.length > 0;

  return {
    messages,
    streaming,
    activeProvider,
    activeModel,
    error,
    isConfigured,
    settings,
    send,
    stop,
    clear,
    refresh: loadAll,
  };
}
