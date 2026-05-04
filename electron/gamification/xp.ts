import { eq } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import { calculateLevel } from '../../src/lib/gamification/levels';
import { recordDailyActivity, updateStreak } from './streaks';

export interface AwardXpResult {
  totalXp: number;
  level: number;
  leveledUp: boolean;
  delta: number;
}

/**
 * Suma XP al usuario, recalcula nivel y registra actividad diaria + streak.
 * @param reason etiqueta libre para logs futuros.
 */
export function awardXp(
  userId: number,
  amount: number,
  reason = 'unspecified',
  options: { lessons?: number; seconds?: number; on?: Date } = {},
): AwardXpResult {
  const db = getDb();
  if (amount <= 0) {
    const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
    if (!user) throw new Error('user not found');
    return { totalXp: user.totalXp, level: user.level, leveledUp: false, delta: 0 };
  }

  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user) throw new Error('user not found');

  const newTotal = user.totalXp + amount;
  const newLevel = calculateLevel(newTotal);
  const leveledUp = newLevel > user.level;

  db.update(schema.users)
    .set({ totalXp: newTotal, level: newLevel })
    .where(eq(schema.users.id, userId))
    .run();

  recordDailyActivity(
    userId,
    { xp: amount, lessons: options.lessons ?? 0, seconds: options.seconds ?? 0 },
    options.on,
  );
  updateStreak(userId, options.on);

  console.log(`[xp] user=${userId} +${amount} (${reason}) → ${newTotal}, lvl ${newLevel}`);

  return { totalXp: newTotal, level: newLevel, leveledUp, delta: amount };
}
