// Tipos del bridge expuesto por preload.ts. Duplicamos las DTO aquí para que el
// renderer NO importe nada de electron/ ni de drizzle (que tirarían better-sqlite3
// al bundle del cliente).

import type { Translations, BadgeCriteria } from '@/lib/db/schema';
import type { LevelProgress, Rank } from '@/lib/gamification/levels';

export interface CurrentUser {
  id: number;
  name: string;
  avatar: string | null;
  createdAt: number | Date;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalXp: number;
  level: number;
  localesUsed: string[];
}

export interface UserStats {
  user: { id: number; name: string; avatar: string | null; createdAt: number };
  totalXp: number;
  level: number;
  rank: Rank;
  levelProgress: LevelProgress;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  totalTimeSeconds: number;
  badgesEarned: number;
  badgesTotal: number;
}

export interface BadgeRow {
  id: number;
  slug: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nameTranslations: Translations;
  descriptionTranslations: Translations;
  criteria: BadgeCriteria;
  earned: boolean;
  earnedAt: number | null;
}

export interface DailyActivityPoint {
  date: string;
  xp: number;
  lessons: number;
  seconds: number;
}

export interface RecentActivityItem {
  type: 'lesson' | 'badge' | 'level_up';
  date: number;
  title: string;
  detail: string;
  icon?: string;
}

export interface AwardXpResult {
  totalXp: number;
  level: number;
  leveledUp: boolean;
  delta: number;
}

export interface CompleteLessonResult {
  xp: AwardXpResult;
  newBadges: Array<{
    id: number;
    slug: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    nameTranslations: Translations;
    descriptionTranslations: Translations;
  }>;
}

export interface DatapathAPI {
  readonly platform: NodeJS.Platform;
  readonly versions: NodeJS.ProcessVersions;
  user: { current: () => Promise<CurrentUser> };
  stats: { get: () => Promise<UserStats> };
  badges: {
    list: () => Promise<BadgeRow[]>;
    check: () => Promise<BadgeRow[]>;
  };
  heatmap: { get: (days?: number) => Promise<DailyActivityPoint[]> };
  activity: { recent: (limit?: number) => Promise<RecentActivityItem[]> };
  xp: {
    award: (p: { amount: number; reason?: string; seconds?: number }) => Promise<AwardXpResult>;
  };
  lesson: {
    complete: (p: {
      lessonSlug: string;
      xp: number;
      score?: number;
      timeSpentSeconds?: number;
    }) => Promise<CompleteLessonResult>;
  };
  locale: { track: (locale: string) => Promise<void> };
}

declare global {
  interface Window {
    datapath: DatapathAPI;
  }
}
