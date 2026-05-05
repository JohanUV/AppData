// Tipos del bridge expuesto por preload.ts. Duplicamos las DTO aquí para que el
// renderer NO importe nada de electron/ ni de drizzle (que tirarían better-sqlite3
// al bundle del cliente).

import type { Translations, BadgeCriteria, AIMessage } from '@/lib/db/schema';
import type { LevelProgress, Rank } from '@/lib/gamification/levels';
import type { ProviderId } from '@/lib/ai/providers-meta';

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

// ── Tutor IA ──
export interface AIPrefs {
  activeProvider: ProviderId;
  fallbackEnabled: boolean;
  fallbackProvider: ProviderId | null;
  modelByProvider: Record<string, string>;
}

export interface AIConversation {
  id: number;
  userId: number;
  lessonSlug: string;
  provider: string;
  model: string;
  messages: AIMessage[];
  createdAt: number | Date;
  updatedAt: number | Date;
}

export interface AIUsageMap {
  [provider: string]: { requests: number; tokens: number };
}

export interface AIFallbackLog {
  provider: ProviderId;
  ok: boolean;
  error?: string;
  ts: number;
}

export type AIChunkPayload =
  | { type: 'started'; provider: ProviderId; model: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; provider: ProviderId; model: string }
  | { type: 'aborted' }
  | { type: 'error'; error: string; status?: number };

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
  ai: {
    encryptionAvailable: () => Promise<boolean>;
    getSettings: () => Promise<AIPrefs>;
    saveSettings: (patch: Partial<AIPrefs>) => Promise<AIPrefs>;
    saveKey: (p: {
      provider: ProviderId;
      key: string;
      customEndpoint?: string;
    }) => Promise<{ ok: boolean; error?: string }>;
    deleteKey: (provider: ProviderId) => Promise<{ ok: boolean }>;
    configuredProviders: () => Promise<ProviderId[]>;
    validateKey: (p: {
      provider: ProviderId;
      key: string;
      customEndpoint?: string;
    }) => Promise<{ ok: boolean; error?: string }>;
    usageToday: () => Promise<AIUsageMap>;
    fallbackLogs: () => Promise<AIFallbackLog[]>;
    getConversation: (lessonSlug: string) => Promise<AIConversation | null>;
    clearConversation: (lessonSlug: string) => Promise<{ ok: boolean }>;
    startChat: (p: {
      streamId: string;
      lessonSlug: string;
      systemPrompt: string;
      userMessage: string;
      forceProvider?: ProviderId;
    }) => Promise<{ ok: boolean }>;
    cancelChat: (streamId: string) => Promise<{ ok: boolean }>;
    onChunk: (streamId: string, cb: (payload: AIChunkPayload) => void) => () => void;
  };
}

declare global {
  interface Window {
    datapath: DatapathAPI;
  }
}
