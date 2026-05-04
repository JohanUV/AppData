import { eq } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import { awardXp, type AwardXpResult } from './xp';
import { checkBadges } from './badges';

/**
 * Simula la finalización de una lección. En fases siguientes se reemplaza por
 * la versión que recibe el id real de una lección persistida en DB.
 *
 * - Crea/actualiza lesson_progress (lección sintética por slug).
 * - Suma XP, actualiza streak, registra actividad diaria.
 * - Evalúa badges y devuelve los recién obtenidos.
 */
export interface CompleteLessonInput {
  userId: number;
  lessonSlug: string;
  xp: number;
  score?: number;
  timeSpentSeconds?: number;
}

export interface CompleteLessonResult {
  xp: AwardXpResult;
  newBadges: schema.Badge[];
}

export function completeLesson(input: CompleteLessonInput): CompleteLessonResult {
  const db = getDb();
  const synthetic = ensureSyntheticLesson(input.lessonSlug);

  db.insert(schema.lessonProgress)
    .values({
      userId: input.userId,
      lessonId: synthetic.id,
      status: 'completed',
      score: input.score ?? 100,
      completedAt: new Date(),
      timeSpent: input.timeSpentSeconds ?? 0,
    })
    .onConflictDoUpdate({
      target: [schema.lessonProgress.userId, schema.lessonProgress.lessonId],
      set: {
        status: 'completed',
        score: input.score ?? 100,
        completedAt: new Date(),
        timeSpent: input.timeSpentSeconds ?? 0,
      },
    })
    .run();

  const xp = awardXp(input.userId, input.xp, `lesson:${input.lessonSlug}`, {
    lessons: 1,
    seconds: input.timeSpentSeconds ?? 0,
  });

  const newBadges = checkBadges(input.userId);

  return { xp, newBadges };
}

/**
 * En fase 4 las lecciones provendrán del contenido MDX seedeado en DB.
 * Por ahora creamos una lección sintética (curso/módulo "demo") para que las
 * métricas funcionen sin romper integridad referencial.
 */
function ensureSyntheticLesson(slug: string): schema.Lesson {
  const db = getDb();

  const course = upsertSimpleRow(schema.courses, {
    slug: 'demo',
    titleTranslations: { es: 'Demo', en: 'Demo', pt: 'Demo' },
    descriptionTranslations: { es: 'Curso de prueba.', en: 'Demo course.', pt: 'Curso de teste.' },
    icon: 'Beaker',
    order: 0,
  });

  const moduleRow = db
    .select()
    .from(schema.modules)
    .where(eq(schema.modules.slug, 'demo'))
    .get() ??
    db
      .insert(schema.modules)
      .values({
        courseId: course.id,
        slug: 'demo',
        titleTranslations: { es: 'Demo', en: 'Demo', pt: 'Demo' },
        order: 0,
        xpReward: 0,
      })
      .returning()
      .get();

  const existing = db
    .select()
    .from(schema.lessons)
    .where(eq(schema.lessons.slug, slug))
    .get();
  if (existing) return existing;

  return db
    .insert(schema.lessons)
    .values({
      moduleId: moduleRow.id,
      slug,
      titleTranslations: { es: slug, en: slug, pt: slug },
      contentPath: `synthetic/${slug}.mdx`,
      type: 'theory',
      xpReward: 50,
      estimatedMinutes: 15,
      order: 0,
    })
    .returning()
    .get();
}

function upsertSimpleRow(
  table: typeof schema.courses,
  values: typeof schema.courses.$inferInsert,
): schema.Course {
  const db = getDb();
  const found = db.select().from(table).where(eq(table.slug, values.slug)).get();
  if (found) return found;
  return db.insert(table).values(values).returning().get();
}

/** Marca un locale como usado por el usuario (para badges polyglot/cosmopolitan). */
export function trackLocaleUsed(userId: number, locale: string): void {
  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user) return;
  const set = new Set((user.localesUsed as string[]) ?? []);
  if (set.has(locale)) return;
  set.add(locale);
  db.update(schema.users)
    .set({ localesUsed: Array.from(set) })
    .where(eq(schema.users.id, userId))
    .run();
}

export { awardXp, checkBadges };
export type { AwardXpResult };
