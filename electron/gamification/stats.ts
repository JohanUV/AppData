import { and, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import { getLevelProgress, getRank } from '../../src/lib/gamification/levels';
import { dateKeyOffset } from './dates';

export interface UserStats {
  user: {
    id: number;
    name: string;
    avatar: string | null;
    createdAt: number;
  };
  totalXp: number;
  level: number;
  rank: ReturnType<typeof getRank>;
  levelProgress: ReturnType<typeof getLevelProgress>;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  totalTimeSeconds: number;
  badgesEarned: number;
  badgesTotal: number;
}

export function getStats(userId: number): UserStats {
  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user) throw new Error('user not found');

  const lessonsRow = db
    .select({ c: sql<number>`count(*)`.as('c') })
    .from(schema.lessonProgress)
    .where(
      and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.status, 'completed')),
    )
    .get();

  const timeRow = db
    .select({ s: sql<number>`coalesce(sum(time_spent), 0)`.as('s') })
    .from(schema.dailyActivity)
    .where(eq(schema.dailyActivity.userId, userId))
    .get();

  const earnedRow = db
    .select({ c: sql<number>`count(*)`.as('c') })
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId))
    .get();

  const totalRow = db.select({ c: sql<number>`count(*)`.as('c') }).from(schema.badges).get();

  return {
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt instanceof Date ? user.createdAt.getTime() : Number(user.createdAt),
    },
    totalXp: user.totalXp,
    level: user.level,
    rank: getRank(user.level),
    levelProgress: getLevelProgress(user.totalXp),
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lessonsCompleted: Number(lessonsRow?.c ?? 0),
    totalTimeSeconds: Number(timeRow?.s ?? 0),
    badgesEarned: Number(earnedRow?.c ?? 0),
    badgesTotal: Number(totalRow?.c ?? 0),
  };
}

export interface BadgeWithStatus extends schema.Badge {
  earned: boolean;
  earnedAt: number | null;
}

export function getAllBadgesWithStatus(userId: number): BadgeWithStatus[] {
  const db = getDb();
  const all = db.select().from(schema.badges).all();
  const owned = db
    .select()
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId))
    .all();
  const ownedMap = new Map(owned.map((r) => [r.badgeId, r.earnedAt]));
  return all.map((b) => {
    const earnedAt = ownedMap.get(b.id) ?? null;
    return {
      ...b,
      earned: earnedAt !== null,
      earnedAt: earnedAt instanceof Date ? earnedAt.getTime() : earnedAt,
    };
  });
}

export interface DailyActivityPoint {
  date: string; // YYYY-MM-DD
  xp: number;
  lessons: number;
  seconds: number;
}

export function getHeatmap(userId: number, days = 90): DailyActivityPoint[] {
  const db = getDb();
  const since = dateKeyOffset(days - 1);
  const rows = db
    .select()
    .from(schema.dailyActivity)
    .where(and(eq(schema.dailyActivity.userId, userId), gte(schema.dailyActivity.date, since)))
    .all();
  return rows.map((r) => ({
    date: r.date,
    xp: r.xpEarned,
    lessons: r.lessonsCompleted,
    seconds: r.timeSpent,
  }));
}

export interface RecentActivityItem {
  type: 'lesson' | 'badge' | 'level_up';
  date: number;
  title: string;
  detail: string;
  icon?: string;
}

export function getRecentActivity(userId: number, limit = 5): RecentActivityItem[] {
  const db = getDb();
  const items: RecentActivityItem[] = [];

  const recentLessons = db
    .select({
      completedAt: schema.lessonProgress.completedAt,
      score: schema.lessonProgress.score,
      title: schema.lessons.titleTranslations,
    })
    .from(schema.lessonProgress)
    .innerJoin(schema.lessons, eq(schema.lessons.id, schema.lessonProgress.lessonId))
    .where(
      and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.status, 'completed')),
    )
    .orderBy(sql`${schema.lessonProgress.completedAt} desc`)
    .limit(limit)
    .all();

  for (const l of recentLessons) {
    if (!l.completedAt) continue;
    const at = l.completedAt instanceof Date ? l.completedAt.getTime() : Number(l.completedAt);
    items.push({
      type: 'lesson',
      date: at,
      title: (l.title as schema.Translations).es,
      detail: `Score: ${l.score}`,
    });
  }

  const recentBadges = db
    .select({
      earnedAt: schema.userBadges.earnedAt,
      name: schema.badges.nameTranslations,
      icon: schema.badges.icon,
    })
    .from(schema.userBadges)
    .innerJoin(schema.badges, eq(schema.badges.id, schema.userBadges.badgeId))
    .where(eq(schema.userBadges.userId, userId))
    .orderBy(sql`${schema.userBadges.earnedAt} desc`)
    .limit(limit)
    .all();

  for (const b of recentBadges) {
    const at = b.earnedAt instanceof Date ? b.earnedAt.getTime() : Number(b.earnedAt);
    items.push({
      type: 'badge',
      date: at,
      title: (b.name as schema.Translations).es,
      detail: 'Logro desbloqueado',
      icon: b.icon,
    });
  }

  items.sort((a, b) => b.date - a.date);
  return items.slice(0, limit);
}
