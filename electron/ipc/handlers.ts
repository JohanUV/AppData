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

export function registerIpcHandlers(): void {
  initDatabase();
  const user = ensureDefaultUser(initDatabase());

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

  ipcMain.handle('locale:track', (_e, locale: string) => {
    gTrackLocale(user.id, locale);
  });
}
