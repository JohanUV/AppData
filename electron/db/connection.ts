import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { bootstrapSql } from '../../src/lib/db/bootstrap-sql';
import * as schema from '../../src/lib/db/schema';
import { seedBadges } from './seed';

let _db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!_db) throw new Error('DB no inicializada. Llama initDatabase() primero.');
  return _db;
}

export function initDatabase(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;

  const userDataDir = app.getPath('userData');
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const dbPath = path.join(userDataDir, 'datapath.db');
  console.log('[db] opening', dbPath);

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  // Bootstrap idempotente (CREATE TABLE IF NOT EXISTS).
  sqlite.exec(bootstrapSql);

  _db = drizzle(sqlite, { schema });

  seedBadges(_db);

  return _db;
}
