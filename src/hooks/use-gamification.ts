'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  BadgeRow,
  CompleteLessonResult,
  DailyActivityPoint,
  RecentActivityItem,
  UserStats,
} from '@/types/datapath-api';

interface State {
  stats: UserStats | null;
  badges: BadgeRow[];
  heatmap: DailyActivityPoint[];
  activity: RecentActivityItem[];
  loading: boolean;
}

const initial: State = { stats: null, badges: [], heatmap: [], activity: [], loading: true };

function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.datapath !== 'undefined';
}

export function useGamification() {
  const [state, setState] = useState<State>(initial);
  const [unlockQueue, setUnlockQueue] = useState<BadgeRow[]>([]);

  const refresh = useCallback(async () => {
    if (!isElectron()) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    const [stats, badges, heatmap, activity] = await Promise.all([
      window.datapath.stats.get(),
      window.datapath.badges.list(),
      window.datapath.heatmap.get(90),
      window.datapath.activity.recent(5),
    ]);
    setState({ stats, badges, heatmap, activity, loading: false });
  }, []);

  useEffect(() => {
    // Carga inicial: el patrón canónico de "fetch on mount" sigue siendo
    // legítimo aunque la regla react-hooks/set-state-in-effect lo marque.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const completeLesson = useCallback(
    async (
      lessonSlug: string,
      xp = 50,
      timeSpentSeconds = 60,
      score = 100,
    ): Promise<CompleteLessonResult> => {
      const result = await window.datapath.lesson.complete({
        lessonSlug,
        xp,
        score,
        timeSpentSeconds,
      });
      await refresh();
      // Encolar badges para el modal
      if (result.newBadges.length) {
        const fresh = await window.datapath.badges.list();
        const newOnes = fresh.filter((b) => result.newBadges.some((nb) => nb.id === b.id));
        setUnlockQueue((q) => [...q, ...newOnes]);
      }
      return result;
    },
    [refresh],
  );

  const trackLocale = useCallback(async (locale: string) => {
    if (!isElectron()) return;
    await window.datapath.locale.track(locale);
    const newBadges = await window.datapath.badges.check();
    if (newBadges.length) {
      const fresh = await window.datapath.badges.list();
      const matched = fresh.filter((b) => newBadges.some((nb) => nb.id === b.id));
      setUnlockQueue((q) => [...q, ...matched]);
      void refresh();
    }
  }, [refresh]);

  const dismissUnlock = useCallback(() => {
    setUnlockQueue((q) => q.slice(1));
  }, []);

  return {
    ...state,
    refresh,
    completeLesson,
    trackLocale,
    unlockQueue,
    currentUnlock: unlockQueue[0] ?? null,
    dismissUnlock,
  };
}
