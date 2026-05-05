// CREATE TABLE IF NOT EXISTS para bootstrap idempotente.
// Cuando la app crezca pasaremos a migraciones generadas con drizzle-kit.

export const bootstrapSql = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  locales_used TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_translations TEXT NOT NULL,
  description_translations TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title_translations TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS modules_course_slug_uq ON modules(course_id, slug);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title_translations TEXT NOT NULL,
  content_path TEXT NOT NULL,
  type TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  "order" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS lessons_module_slug_uq ON lessons(module_id, slug);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  score INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  time_spent INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS lesson_progress_user_lesson_uq ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS lesson_progress_user_idx ON lesson_progress(user_id);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  solution TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 20
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  attempt_data TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 0,
  attempted_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX IF NOT EXISTS exercise_attempts_user_idx ON exercise_attempts(user_id);

CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_translations TEXT NOT NULL,
  description_translations TEXT NOT NULL,
  icon TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  criteria_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_uq ON user_badges(user_id, badge_id);

CREATE TABLE IF NOT EXISTS daily_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS daily_activity_user_date_uq ON daily_activity(user_id, date);

CREATE TABLE IF NOT EXISTS ai_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  active_provider TEXT NOT NULL DEFAULT 'cerebras',
  fallback_enabled INTEGER NOT NULL DEFAULT 1,
  fallback_provider TEXT,
  model_by_provider TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS ai_keys (
  provider TEXT PRIMARY KEY,
  encrypted_key TEXT NOT NULL,
  custom_endpoint TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  messages_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE UNIQUE INDEX IF NOT EXISTS ai_conversations_user_lesson_uq ON ai_conversations(user_id, lesson_slug);

CREATE TABLE IF NOT EXISTS ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  provider TEXT NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS ai_usage_uq ON ai_usage(user_id, date, provider);
`;
