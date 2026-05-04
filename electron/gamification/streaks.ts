import { eq, sql } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import { todayKey, diffDays } from './dates';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  changed: boolean;
}

/** Reglas:
 *  - Mismo día → streak intacto.
 *  - Día consecutivo → +1.
 *  - Salto > 1 día → reset a 1.
 *  Actualiza tanto users.current_streak como longest_streak.
 */
export function updateStreak(userId: number, on: Date = new Date()): StreakResult {
  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user) throw new Error('user not found');

  const today = todayKey(on);
  const last = user.lastActivityDate;

  let next = user.currentStreak;
  let changed = false;

  if (!last) {
    next = 1;
    changed = true;
  } else if (last === today) {
    // sin cambio
  } else {
    const delta = diffDays(last, today);
    if (delta === 1) {
      next = user.currentStreak + 1;
      changed = true;
    } else {
      next = 1;
      changed = true;
    }
  }

  const longest = Math.max(user.longestStreak, next);

  if (changed || last !== today) {
    db.update(schema.users)
      .set({ currentStreak: next, longestStreak: longest, lastActivityDate: today })
      .where(eq(schema.users.id, userId))
      .run();
  }

  return { currentStreak: next, longestStreak: longest, changed };
}

/** Acumula actividad diaria (heatmap, marathon, etc.). */
export function recordDailyActivity(
  userId: number,
  args: { xp: number; lessons: number; seconds: number },
  on: Date = new Date(),
): void {
  const db = getDb();
  const date = todayKey(on);

  db.insert(schema.dailyActivity)
    .values({
      userId,
      date,
      xpEarned: args.xp,
      lessonsCompleted: args.lessons,
      timeSpent: args.seconds,
    })
    .onConflictDoUpdate({
      target: [schema.dailyActivity.userId, schema.dailyActivity.date],
      set: {
        xpEarned: sql`${schema.dailyActivity.xpEarned} + ${args.xp}`,
        lessonsCompleted: sql`${schema.dailyActivity.lessonsCompleted} + ${args.lessons}`,
        timeSpent: sql`${schema.dailyActivity.timeSpent} + ${args.seconds}`,
      },
    })
    .run();
}
