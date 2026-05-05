import { eq, sql } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import type { ProviderId } from '../../src/lib/ai/providers-meta';

export interface AIPrefs {
  activeProvider: ProviderId;
  fallbackEnabled: boolean;
  fallbackProvider: ProviderId | null;
  modelByProvider: Record<string, string>;
}

export function loadSettings(): AIPrefs {
  const db = getDb();
  const row = db.select().from(schema.aiSettings).limit(1).get();
  if (!row) {
    db.insert(schema.aiSettings).values({}).run();
    return {
      activeProvider: 'cerebras',
      fallbackEnabled: true,
      fallbackProvider: null,
      modelByProvider: {},
    };
  }
  return {
    activeProvider: row.activeProvider as ProviderId,
    fallbackEnabled: Boolean(row.fallbackEnabled),
    fallbackProvider: (row.fallbackProvider as ProviderId | null) ?? null,
    modelByProvider: row.modelByProvider ?? {},
  };
}

export function saveSettings(patch: Partial<AIPrefs>): AIPrefs {
  const db = getDb();
  const current = loadSettings();
  const next = { ...current, ...patch };
  const row = db.select().from(schema.aiSettings).limit(1).get();
  if (!row) {
    db.insert(schema.aiSettings)
      .values({
        activeProvider: next.activeProvider,
        fallbackEnabled: next.fallbackEnabled,
        fallbackProvider: next.fallbackProvider,
        modelByProvider: next.modelByProvider,
        updatedAt: new Date(),
      })
      .run();
  } else {
    db.update(schema.aiSettings)
      .set({
        activeProvider: next.activeProvider,
        fallbackEnabled: next.fallbackEnabled,
        fallbackProvider: next.fallbackProvider,
        modelByProvider: next.modelByProvider,
        updatedAt: new Date(),
      })
      .where(eq(schema.aiSettings.id, row.id))
      .run();
  }
  return next;
}

export function recordUsage(
  userId: number,
  provider: ProviderId,
  args: { requests?: number; inputTokens?: number; outputTokens?: number },
): void {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  db.insert(schema.aiUsage)
    .values({
      userId,
      date: today,
      provider,
      requests: args.requests ?? 0,
      inputTokens: args.inputTokens ?? 0,
      outputTokens: args.outputTokens ?? 0,
    })
    .onConflictDoUpdate({
      target: [schema.aiUsage.userId, schema.aiUsage.date, schema.aiUsage.provider],
      set: {
        requests: sql`${schema.aiUsage.requests} + ${args.requests ?? 0}`,
        inputTokens: sql`${schema.aiUsage.inputTokens} + ${args.inputTokens ?? 0}`,
        outputTokens: sql`${schema.aiUsage.outputTokens} + ${args.outputTokens ?? 0}`,
      },
    })
    .run();
}

export function getUsageToday(userId: number): Record<ProviderId, { requests: number; tokens: number }> {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const rows = db
    .select()
    .from(schema.aiUsage)
    .where(sql`user_id = ${userId} AND date = ${today}`)
    .all();
  const result: Record<string, { requests: number; tokens: number }> = {};
  for (const r of rows) {
    result[r.provider] = {
      requests: r.requests,
      tokens: r.inputTokens + r.outputTokens,
    };
  }
  return result as Record<ProviderId, { requests: number; tokens: number }>;
}
