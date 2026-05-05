// Smoke test DB-only para Fase 5: persistencia de ai_settings, ai_keys,
// ai_conversations, ai_usage. NO valida safeStorage (eso requiere runtime
// de Electron — se prueba arrancando la app real).
import Database from 'better-sqlite3';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { bootstrapSql } from '../src/lib/db/bootstrap-sql.ts';

const dbPath = join(tmpdir(), `datapath-smoke-${Date.now()}.db`);
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.exec(bootstrapSql);

let pass = 0;
let fail = 0;
function check(name, cond, detail = '') {
  if (cond) { console.log(`  PASS  ${name}`); pass++; }
  else { console.log(`  FAIL  ${name} ${detail}`); fail++; }
}

console.log('\n[1] schema bootstrap');
const tables = sqlite
  .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'ai_%'`)
  .all()
  .map((r) => r.name)
  .sort();
check('ai_* tables created', JSON.stringify(tables) === JSON.stringify(['ai_conversations', 'ai_keys', 'ai_settings', 'ai_usage']), tables.join(','));

console.log('\n[2] ai_settings upsert (singleton-ish)');
sqlite.prepare(`INSERT INTO ai_settings (active_provider, fallback_enabled, fallback_provider, model_by_provider) VALUES (?,?,?,?)`)
  .run('cerebras', 1, 'groq', JSON.stringify({ cerebras: 'llama-3.3-70b' }));
const s1 = sqlite.prepare(`SELECT * FROM ai_settings ORDER BY id DESC LIMIT 1`).get();
check('settings row inserted', s1?.active_provider === 'cerebras');
check('fallback_provider persisted', s1?.fallback_provider === 'groq');
check('model_by_provider JSON parses', JSON.parse(s1.model_by_provider).cerebras === 'llama-3.3-70b');

console.log('\n[3] ai_keys upsert (encrypted bytes simulado)');
const fakeEnc1 = Buffer.from('not-real-cipher-1').toString('base64');
const fakeEnc2 = Buffer.from('not-real-cipher-2').toString('base64');
sqlite.prepare(`INSERT INTO ai_keys (provider, encrypted_key, custom_endpoint) VALUES (?,?,?) ON CONFLICT(provider) DO UPDATE SET encrypted_key=excluded.encrypted_key, custom_endpoint=excluded.custom_endpoint`)
  .run('cerebras', fakeEnc1, null);
sqlite.prepare(`INSERT INTO ai_keys (provider, encrypted_key, custom_endpoint) VALUES (?,?,?) ON CONFLICT(provider) DO UPDATE SET encrypted_key=excluded.encrypted_key, custom_endpoint=excluded.custom_endpoint`)
  .run('cerebras', fakeEnc2, null);
const k1 = sqlite.prepare(`SELECT * FROM ai_keys WHERE provider=?`).get('cerebras');
check('key insert + upsert mantiene un solo row', sqlite.prepare(`SELECT COUNT(*) as c FROM ai_keys WHERE provider=?`).get('cerebras').c === 1);
check('upsert reemplazó encrypted_key', k1.encrypted_key === fakeEnc2);

sqlite.prepare(`INSERT INTO ai_keys (provider, encrypted_key, custom_endpoint) VALUES (?,?,?)`).run('custom', 'xxx', 'https://my-llm.local/v1');
const kc = sqlite.prepare(`SELECT * FROM ai_keys WHERE provider=?`).get('custom');
check('custom_endpoint persistido', kc.custom_endpoint === 'https://my-llm.local/v1');

console.log('\n[4] ai_conversations: crear user, persistir mensajes, upsert');
sqlite.prepare(`INSERT INTO users (name) VALUES (?)`).run('Smoke');
const userId = sqlite.prepare(`SELECT id FROM users ORDER BY id DESC LIMIT 1`).get().id;

const msgs1 = JSON.stringify([
  { role: 'system', content: 'eres tutor' },
  { role: 'user', content: 'qué es ETL?' },
]);
sqlite.prepare(`INSERT INTO ai_conversations (user_id, lesson_slug, provider, model, messages_json) VALUES (?,?,?,?,?) ON CONFLICT(user_id, lesson_slug) DO UPDATE SET messages_json=excluded.messages_json, provider=excluded.provider, model=excluded.model, updated_at=unixepoch()*1000`)
  .run(userId, 'what-is-data-engineering', 'cerebras', 'llama-3.3-70b', msgs1);

const msgs2 = JSON.stringify([
  { role: 'system', content: 'eres tutor' },
  { role: 'user', content: 'qué es ETL?' },
  { role: 'assistant', content: 'extract transform load' },
]);
sqlite.prepare(`INSERT INTO ai_conversations (user_id, lesson_slug, provider, model, messages_json) VALUES (?,?,?,?,?) ON CONFLICT(user_id, lesson_slug) DO UPDATE SET messages_json=excluded.messages_json, provider=excluded.provider, model=excluded.model, updated_at=unixepoch()*1000`)
  .run(userId, 'what-is-data-engineering', 'cerebras', 'llama-3.3-70b', msgs2);

const conv = sqlite.prepare(`SELECT * FROM ai_conversations WHERE user_id=? AND lesson_slug=?`).get(userId, 'what-is-data-engineering');
const parsed = JSON.parse(conv.messages_json);
check('upsert por (user_id, lesson_slug)', sqlite.prepare(`SELECT COUNT(*) as c FROM ai_conversations`).get().c === 1);
check('messages crecieron 2 → 3', parsed.length === 3);
check('último mensaje es assistant', parsed[2].role === 'assistant');

console.log('\n[5] ai_usage: incrementos diarios');
sqlite.prepare(`INSERT INTO ai_usage (user_id, date, provider, requests, input_tokens, output_tokens) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id, date, provider) DO UPDATE SET requests=ai_usage.requests+excluded.requests, input_tokens=ai_usage.input_tokens+excluded.input_tokens, output_tokens=ai_usage.output_tokens+excluded.output_tokens`)
  .run(userId, '2026-05-04', 'cerebras', 1, 100, 50);
sqlite.prepare(`INSERT INTO ai_usage (user_id, date, provider, requests, input_tokens, output_tokens) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id, date, provider) DO UPDATE SET requests=ai_usage.requests+excluded.requests, input_tokens=ai_usage.input_tokens+excluded.input_tokens, output_tokens=ai_usage.output_tokens+excluded.output_tokens`)
  .run(userId, '2026-05-04', 'cerebras', 2, 250, 130);

const usage = sqlite.prepare(`SELECT * FROM ai_usage WHERE user_id=? AND date=? AND provider=?`).get(userId, '2026-05-04', 'cerebras');
check('usage row único por (user, date, provider)', sqlite.prepare(`SELECT COUNT(*) as c FROM ai_usage`).get().c === 1);
check('requests acumulados (1+2=3)', usage.requests === 3);
check('input_tokens acumulados (100+250=350)', usage.input_tokens === 350);
check('output_tokens acumulados (50+130=180)', usage.output_tokens === 180);

sqlite.close();
if (existsSync(dbPath)) try { unlinkSync(dbPath); } catch {}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
