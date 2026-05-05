/**
 * Schema Drizzle de DataPath. Ejecutado en el main process (better-sqlite3).
 * El renderer puede importar tipos (`type User = typeof users.$inferSelect`)
 * sin pulling runtime de drizzle-orm/sqlite-core en el bundle de cliente
 * siempre que use `import type`.
 */
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Mapas de traducción { es, en, pt } guardados como JSON en TEXT.
export type Translations = { es: string; en: string; pt: string };

// ──────────────────────────────────────────────────────────────────────
// Users (perfil local; cuenta cloud llegará después)
// ──────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActivityDate: text('last_activity_date'), // YYYY-MM-DD
  totalXp: integer('total_xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  // Idiomas que el usuario ha usado en la app — alimenta badges polyglot/cosmopolitan.
  localesUsed: text('locales_used', { mode: 'json' }).$type<string[]>().notNull().default([]),
});

// ──────────────────────────────────────────────────────────────────────
// Courses → Modules → Lessons
// ──────────────────────────────────────────────────────────────────────
export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  titleTranslations: text('title_translations', { mode: 'json' }).$type<Translations>().notNull(),
  descriptionTranslations: text('description_translations', { mode: 'json' })
    .$type<Translations>()
    .notNull(),
  icon: text('icon'),
  order: integer('order').notNull().default(0),
});

export const modules = sqliteTable(
  'modules',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    titleTranslations: text('title_translations', { mode: 'json' }).$type<Translations>().notNull(),
    order: integer('order').notNull().default(0),
    xpReward: integer('xp_reward').notNull().default(0),
  },
  (t) => ({
    moduleSlugUq: uniqueIndex('modules_course_slug_uq').on(t.courseId, t.slug),
  }),
);

export const lessons = sqliteTable(
  'lessons',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    moduleId: integer('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    titleTranslations: text('title_translations', { mode: 'json' }).$type<Translations>().notNull(),
    contentPath: text('content_path').notNull(), // ruta relativa al MDX
    type: text('type', { enum: ['theory', 'exercise', 'quiz', 'project'] }).notNull(),
    xpReward: integer('xp_reward').notNull().default(50),
    estimatedMinutes: integer('estimated_minutes').notNull().default(15),
    order: integer('order').notNull().default(0),
  },
  (t) => ({
    lessonSlugUq: uniqueIndex('lessons_module_slug_uq').on(t.moduleId, t.slug),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// Progreso del usuario por lección
// ──────────────────────────────────────────────────────────────────────
export const lessonProgress = sqliteTable(
  'lesson_progress',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: integer('lesson_id').notNull(),
    status: text('status', { enum: ['locked', 'in_progress', 'completed'] })
      .notNull()
      .default('in_progress'),
    score: integer('score').notNull().default(0),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    timeSpent: integer('time_spent').notNull().default(0), // segundos
  },
  (t) => ({
    progressUserLessonUq: uniqueIndex('lesson_progress_user_lesson_uq').on(t.userId, t.lessonId),
    progressUserIdx: index('lesson_progress_user_idx').on(t.userId),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// Ejercicios e intentos
// ──────────────────────────────────────────────────────────────────────
export const exercises = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lessonId: integer('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['code', 'sql', 'multiple_choice', 'fill_blank'] }).notNull(),
  content: text('content', { mode: 'json' }).notNull(), // estructura específica por tipo
  solution: text('solution', { mode: 'json' }).notNull(),
  xpReward: integer('xp_reward').notNull().default(20),
});

export const exerciseAttempts = sqliteTable(
  'exercise_attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    attemptData: text('attempt_data', { mode: 'json' }).notNull(),
    success: integer('success', { mode: 'boolean' }).notNull().default(false),
    attemptedAt: integer('attempted_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    attemptsUserIdx: index('exercise_attempts_user_idx').on(t.userId),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// Badges + relación many-to-many con users
// ──────────────────────────────────────────────────────────────────────
// criteria_json describe la regla de desbloqueo. Tipos:
//   { type: 'first_lesson' }
//   { type: 'lessons_count', count: number }
//   { type: 'streak', days: number }
//   { type: 'total_xp', xp: number }
//   { type: 'level', level: number }
//   { type: 'time_of_day', before?: number, after?: number } // hora local 0-23
//   { type: 'marathon', minutes: number }                     // tiempo en un día
//   { type: 'module_complete', moduleSlug: string }
//   { type: 'perfect_score', count?: number }
//   { type: 'polyglot', minLocales: number }
//   { type: 'weekend_warrior' }
//   { type: 'comeback', daysAway: number }
//   { type: 'fast_learner' }
//   { type: 'badge_count', count: number }
export type BadgeCriteria =
  | { type: 'first_lesson' }
  | { type: 'lessons_count'; count: number }
  | { type: 'streak'; days: number }
  | { type: 'total_xp'; xp: number }
  | { type: 'level'; level: number }
  | { type: 'time_of_day'; before?: number; after?: number }
  | { type: 'marathon'; minutes: number }
  | { type: 'module_complete'; moduleSlug: string }
  | { type: 'perfect_score'; count?: number }
  | { type: 'polyglot'; minLocales: number }
  | { type: 'weekend_warrior' }
  | { type: 'comeback'; daysAway: number }
  | { type: 'fast_learner' }
  | { type: 'badge_count'; count: number };

export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  nameTranslations: text('name_translations', { mode: 'json' }).$type<Translations>().notNull(),
  descriptionTranslations: text('description_translations', { mode: 'json' })
    .$type<Translations>()
    .notNull(),
  icon: text('icon').notNull(), // nombre de Lucide icon
  tier: text('tier', { enum: ['bronze', 'silver', 'gold', 'platinum'] })
    .notNull()
    .default('bronze'),
  criteria: text('criteria_json', { mode: 'json' }).$type<BadgeCriteria>().notNull(),
});

export const userBadges = sqliteTable(
  'user_badges',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeId: integer('badge_id')
      .notNull()
      .references(() => badges.id, { onDelete: 'cascade' }),
    earnedAt: integer('earned_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    userBadgesUq: uniqueIndex('user_badges_uq').on(t.userId, t.badgeId),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// Actividad diaria (alimenta heatmap, streaks y badges day-based)
// ──────────────────────────────────────────────────────────────────────
export const dailyActivity = sqliteTable(
  'daily_activity',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // YYYY-MM-DD en hora local
    xpEarned: integer('xp_earned').notNull().default(0),
    lessonsCompleted: integer('lessons_completed').notNull().default(0),
    timeSpent: integer('time_spent').notNull().default(0), // segundos
  },
  (t) => ({
    dailyActivityUq: uniqueIndex('daily_activity_user_date_uq').on(t.userId, t.date),
  }),
);

// ──────────────────────────────────────────────────────────────────────
// Tipos derivados para uso en main + renderer
// ──────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────
// Tutor IA — settings, keys, conversaciones y uso
// ──────────────────────────────────────────────────────────────────────
export const aiSettings = sqliteTable('ai_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  activeProvider: text('active_provider').notNull().default('cerebras'),
  fallbackEnabled: integer('fallback_enabled', { mode: 'boolean' }).notNull().default(true),
  fallbackProvider: text('fallback_provider'),
  modelByProvider: text('model_by_provider', { mode: 'json' })
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const aiKeys = sqliteTable('ai_keys', {
  provider: text('provider').primaryKey(),
  encryptedKey: text('encrypted_key').notNull(),
  customEndpoint: text('custom_endpoint'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type AIRole = 'system' | 'user' | 'assistant';
export interface AIMessage {
  role: AIRole;
  content: string;
  ts?: number;
}

export const aiConversations = sqliteTable(
  'ai_conversations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonSlug: text('lesson_slug').notNull(),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    messages: text('messages_json', { mode: 'json' }).$type<AIMessage[]>().notNull().default([]),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    convoUserLessonUq: uniqueIndex('ai_conversations_user_lesson_uq').on(t.userId, t.lessonSlug),
  }),
);

export const aiUsage = sqliteTable(
  'ai_usage',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // YYYY-MM-DD
    provider: text('provider').notNull(),
    requests: integer('requests').notNull().default(0),
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
  },
  (t) => ({
    usageUq: uniqueIndex('ai_usage_uq').on(t.userId, t.date, t.provider),
  }),
);

export type AISettings = typeof aiSettings.$inferSelect;
export type AIKey = typeof aiKeys.$inferSelect;
export type AIConversation = typeof aiConversations.$inferSelect;
export type AIUsage = typeof aiUsage.$inferSelect;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type DailyActivity = typeof dailyActivity.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Course = typeof courses.$inferSelect;
