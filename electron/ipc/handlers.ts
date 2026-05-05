import { ipcMain } from 'electron';
import { initDatabase } from '../db/connection';
import { ensureDefaultUser } from '../db/seed';
import {
  getStats,
  getAllBadgesWithStatus,
  getHeatmap,
  getRecentActivity,
} from '../gamification/stats';
import {
  awardXp as gAwardXp,
  checkBadges as gCheckBadges,
  completeLesson as gCompleteLesson,
  trackLocaleUsed as gTrackLocale,
} from '../gamification/index';
import {
  isEncryptionAvailable,
  saveKey,
  deleteKey,
  configuredProviders,
  loadKey,
} from '../ai/keys';
import { loadSettings, saveSettings, getUsageToday } from '../ai/settings';
import {
  getConversation,
  clearConversation,
} from '../ai/conversations';
import { startChat, cancelStream, getFallbackLogs } from '../ai/chat';
import { getProvider, chatWithCustomEndpoint } from '../ai/providers';
import type { ProviderId } from '../../src/lib/ai/providers-meta';

export function registerIpcHandlers(): void {
  initDatabase();
  const user = ensureDefaultUser(initDatabase());

  // ── Gamification ──
  ipcMain.handle('user:current', () => ({ ...user }));
  ipcMain.handle('stats:get', () => getStats(user.id));
  ipcMain.handle('badges:list', () => getAllBadgesWithStatus(user.id));
  ipcMain.handle('heatmap:get', (_e, days?: number) => getHeatmap(user.id, days ?? 90));
  ipcMain.handle('activity:recent', (_e, limit?: number) =>
    getRecentActivity(user.id, limit ?? 5),
  );
  ipcMain.handle(
    'xp:award',
    (_e, payload: { amount: number; reason?: string; seconds?: number }) =>
      gAwardXp(user.id, payload.amount, payload.reason ?? 'manual', {
        lessons: 0,
        seconds: payload.seconds ?? 0,
      }),
  );
  ipcMain.handle(
    'lesson:complete',
    (
      _e,
      payload: { lessonSlug: string; xp: number; score?: number; timeSpentSeconds?: number },
    ) =>
      gCompleteLesson({
        userId: user.id,
        lessonSlug: payload.lessonSlug,
        xp: payload.xp,
        score: payload.score,
        timeSpentSeconds: payload.timeSpentSeconds,
      }),
  );
  ipcMain.handle('badges:check', () => gCheckBadges(user.id));
  ipcMain.handle('locale:track', (_e, locale: string) => gTrackLocale(user.id, locale));

  // ── AI: settings ──
  ipcMain.handle('ai:encryption-available', () => isEncryptionAvailable());
  ipcMain.handle('ai:settings:get', () => loadSettings());
  ipcMain.handle('ai:settings:save', (_e, patch: Parameters<typeof saveSettings>[0]) =>
    saveSettings(patch),
  );

  // ── AI: keys ──
  ipcMain.handle(
    'ai:key:save',
    (_e, payload: { provider: ProviderId; key: string; customEndpoint?: string }) =>
      saveKey(payload.provider, payload.key, payload.customEndpoint),
  );
  ipcMain.handle('ai:key:delete', (_e, provider: ProviderId) => {
    deleteKey(provider);
    return { ok: true };
  });
  ipcMain.handle('ai:key:configured', () => configuredProviders());

  ipcMain.handle(
    'ai:key:validate',
    async (_e, payload: { provider: ProviderId; key: string; customEndpoint?: string }) => {
      const prov = getProvider(payload.provider);
      return prov.validateKey(payload.key, payload.customEndpoint);
    },
  );

  // ── AI: usage + logs ──
  ipcMain.handle('ai:usage:today', () => getUsageToday(user.id));
  ipcMain.handle('ai:fallback:logs', () => getFallbackLogs());

  // ── AI: conversaciones ──
  ipcMain.handle('ai:conversation:get', (_e, lessonSlug: string) =>
    getConversation(user.id, lessonSlug),
  );
  ipcMain.handle('ai:conversation:clear', (_e, lessonSlug: string) => {
    clearConversation(user.id, lessonSlug);
    return { ok: true };
  });

  // ── AI: chat (streaming via webContents.send) ──
  ipcMain.handle(
    'ai:chat:start',
    async (
      _e,
      payload: {
        streamId: string;
        lessonSlug: string;
        systemPrompt: string;
        userMessage: string;
        forceProvider?: ProviderId;
      },
    ) => {
      // No await: el stream se propaga vía eventos `ai:chunk:<streamId>`.
      void startChat(payload.streamId, {
        userId: user.id,
        lessonSlug: payload.lessonSlug,
        systemPrompt: payload.systemPrompt,
        userMessage: payload.userMessage,
        forceProvider: payload.forceProvider,
      });
      return { ok: true };
    },
  );
  ipcMain.handle('ai:chat:cancel', (_e, streamId: string) => {
    cancelStream(streamId);
    return { ok: true };
  });

  // Marcar referencias usadas (loadKey + chatWithCustomEndpoint pueden ser
  // requeridos en el futuro desde IPC sin tocar este archivo).
  void loadKey;
  void chatWithCustomEndpoint;
}
