import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import { todayKey, dateKeyOffset } from './dates';

/**
 * Evalúa todos los badges contra el progreso del user y desbloquea los nuevos.
 * Retorna los badges recién obtenidos (para mostrar el modal celebratorio).
 */
export function checkBadges(userId: number, on: Date = new Date()): schema.Badge[] {
  const db = getDb();

  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user) return [];

  const allBadges = db.select().from(schema.badges).all();
  const owned = db
    .select({ badgeId: schema.userBadges.badgeId })
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId))
    .all();
  const ownedSet = new Set(owned.map((r) => r.badgeId));

  // Métricas precomputadas — evitamos N queries dentro del loop.
  const metrics = computeMetrics(userId, on);

  const newlyEarned: schema.Badge[] = [];

  for (const badge of allBadges) {
    if (ownedSet.has(badge.id)) continue;
    if (!evaluate(badge.criteria, user, metrics)) continue;

    db.insert(schema.userBadges)
      .values({ userId, badgeId: badge.id })
      .onConflictDoNothing()
      .run();
    newlyEarned.push(badge);
  }

  // Algunos badges (badge_count) dependen del propio conteo de badges, así que
  // re-evaluamos una vez si hubo cambios. Una pasada extra es suficiente.
  if (newlyEarned.length > 0) {
    const updatedOwned = ownedSet.size + newlyEarned.length;
    metrics.badgeCount = updatedOwned;
    for (const badge of allBadges) {
      if (ownedSet.has(badge.id)) continue;
      if (newlyEarned.some((n) => n.id === badge.id)) continue;
      if (badge.criteria.type !== 'badge_count') continue;
      if (!evaluate(badge.criteria, user, metrics)) continue;
      db.insert(schema.userBadges)
        .values({ userId, badgeId: badge.id })
        .onConflictDoNothing()
        .run();
      newlyEarned.push(badge);
    }
  }

  return newlyEarned;
}

interface Metrics {
  lessonsCompleted: number;
  perfectScores: number;
  fastLessons: number;
  earliestLessonHour: number | null;
  latestLessonHour: number | null;
  marathonMinutes: number;
  badgeCount: number;
  daysAway: number;
  weekendBoth: boolean;
  localesUsed: number;
}

function computeMetrics(userId: number, on: Date): Metrics {
  const db = getDb();
  const userRow = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();

  // Lecciones completadas
  const lessonsCompletedRow = db
    .select({ c: sql<number>`count(*)`.as('c') })
    .from(schema.lessonProgress)
    .where(
      and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.status, 'completed')),
    )
    .get();
  const lessonsCompleted = Number(lessonsCompletedRow?.c ?? 0);

  // Puntajes perfectos
  const perfectRow = db
    .select({ c: sql<number>`count(*)`.as('c') })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.score, 100)))
    .get();
  const perfectScores = Number(perfectRow?.c ?? 0);

  // Fast learner: lección completada en menos del estimado
  const fastRow = db
    .select({ c: sql<number>`count(*)`.as('c') })
    .from(schema.lessonProgress)
    .innerJoin(schema.lessons, eq(schema.lessons.id, schema.lessonProgress.lessonId))
    .where(
      and(
        eq(schema.lessonProgress.userId, userId),
        eq(schema.lessonProgress.status, 'completed'),
        sql`${schema.lessonProgress.timeSpent} > 0`,
        sql`${schema.lessonProgress.timeSpent} < ${schema.lessons.estimatedMinutes} * 60`,
      ),
    )
    .get();
  const fastLessons = Number(fastRow?.c ?? 0);

  // Hora más temprana / tardía de completion (en hora local del registro)
  const completions = db
    .select({ at: schema.lessonProgress.completedAt })
    .from(schema.lessonProgress)
    .where(
      and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.status, 'completed')),
    )
    .all();
  let earliest: number | null = null;
  let latest: number | null = null;
  for (const c of completions) {
    if (!c.at) continue;
    const hour = new Date(c.at).getHours();
    if (earliest === null || hour < earliest) earliest = hour;
    if (latest === null || hour > latest) latest = hour;
  }

  // Maratón: máximo time_spent en daily_activity
  const marathonRow = db
    .select({ s: sql<number>`max(time_spent)`.as('s') })
    .from(schema.dailyActivity)
    .where(eq(schema.dailyActivity.userId, userId))
    .get();
  const marathonMinutes = Math.floor(Number(marathonRow?.s ?? 0) / 60);

  // Badges actuales
  const badgeCountRow = db
    .select({ c: sql<number>`count(*)`.as('c') })
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId))
    .get();
  const badgeCount = Number(badgeCountRow?.c ?? 0);

  // Comeback: días entre la actividad anterior y hoy
  const today = todayKey(on);
  const recentDays = db
    .select({ date: schema.dailyActivity.date })
    .from(schema.dailyActivity)
    .where(eq(schema.dailyActivity.userId, userId))
    .orderBy(sql`${schema.dailyActivity.date} desc`)
    .limit(2)
    .all();
  let daysAway = 0;
  if (recentDays.length >= 2 && recentDays[0]?.date === today) {
    const a = new Date(recentDays[1]!.date + 'T00:00:00').getTime();
    const b = new Date(today + 'T00:00:00').getTime();
    daysAway = Math.round((b - a) / 86_400_000) - 1;
  }

  // Weekend warrior: actividad sáb + dom de la misma ISO week
  const last14 = db
    .select({ date: schema.dailyActivity.date })
    .from(schema.dailyActivity)
    .where(
      and(
        eq(schema.dailyActivity.userId, userId),
        sql`${schema.dailyActivity.date} >= ${dateKeyOffset(14)}`,
      ),
    )
    .all();
  const weekendBoth = hasSameWeekendPair(last14.map((r) => r.date));

  // Idiomas usados
  const localesArr = (userRow?.localesUsed ?? []) as string[];
  const localesUsed = new Set(localesArr).size;

  return {
    lessonsCompleted,
    perfectScores,
    fastLessons,
    earliestLessonHour: earliest,
    latestLessonHour: latest,
    marathonMinutes,
    badgeCount,
    daysAway,
    weekendBoth,
    localesUsed,
  };
}

function hasSameWeekendPair(dates: string[]): boolean {
  // Agrupa por (año, semana ISO) y revisa que existan sábado(6) y domingo(0).
  const byWeek = new Map<string, Set<number>>();
  for (const d of dates) {
    const dt = new Date(d + 'T00:00:00');
    const key = `${dt.getFullYear()}-W${getISOWeek(dt)}`;
    const set = byWeek.get(key) ?? new Set();
    set.add(dt.getDay());
    byWeek.set(key, set);
  }
  for (const set of byWeek.values()) {
    if (set.has(6) && set.has(0)) return true;
  }
  return false;
}

function getISOWeek(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604_800_000);
}

function evaluate(
  criteria: schema.BadgeCriteria,
  u: schema.User,
  m: Metrics,
): boolean {
  switch (criteria.type) {
    case 'first_lesson':
      return m.lessonsCompleted >= 1;
    case 'lessons_count':
      return m.lessonsCompleted >= criteria.count;
    case 'streak':
      return u.currentStreak >= criteria.days || u.longestStreak >= criteria.days;
    case 'total_xp':
      return u.totalXp >= criteria.xp;
    case 'level':
      return u.level >= criteria.level;
    case 'time_of_day':
      if (criteria.before !== undefined) {
        return m.earliestLessonHour !== null && m.earliestLessonHour < criteria.before;
      }
      if (criteria.after !== undefined) {
        return m.latestLessonHour !== null && m.latestLessonHour >= criteria.after;
      }
      return false;
    case 'marathon':
      return m.marathonMinutes >= criteria.minutes;
    case 'module_complete':
      return moduleComplete(u.id, criteria.moduleSlug);
    case 'perfect_score':
      return m.perfectScores >= (criteria.count ?? 1);
    case 'polyglot':
      return m.localesUsed >= criteria.minLocales;
    case 'weekend_warrior':
      return m.weekendBoth;
    case 'comeback':
      return m.daysAway >= criteria.daysAway;
    case 'fast_learner':
      return m.fastLessons >= 1;
    case 'badge_count':
      return m.badgeCount >= criteria.count;
  }
}

function moduleComplete(userId: number, moduleSlug: string): boolean {
  const db = getDb();
  const mod = db.select().from(schema.modules).where(eq(schema.modules.slug, moduleSlug)).get();
  if (!mod) return false;
  const lessonsInModule = db
    .select({ id: schema.lessons.id })
    .from(schema.lessons)
    .where(eq(schema.lessons.moduleId, mod.id))
    .all();
  if (lessonsInModule.length === 0) return false;
  const completed = db
    .select({ c: sql<number>`count(*)`.as('c') })
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.userId, userId),
        eq(schema.lessonProgress.status, 'completed'),
        sql`${schema.lessonProgress.lessonId} in (${sql.join(
          lessonsInModule.map((l) => sql`${l.id}`),
          sql`, `,
        )})`,
      ),
    )
    .get();
  return Number(completed?.c ?? 0) >= lessonsInModule.length;
}
