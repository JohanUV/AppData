import { safeStorage } from 'electron';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import type { ProviderId } from '../../src/lib/ai/providers-meta';

export interface SaveKeyResult {
  ok: boolean;
  error?: string;
}

export function isEncryptionAvailable(): boolean {
  try {
    return safeStorage.isEncryptionAvailable();
  } catch {
    return false;
  }
}

export function saveKey(provider: ProviderId, plain: string, customEndpoint?: string): SaveKeyResult {
  if (!plain) return { ok: false, error: 'API key vacía' };
  if (!isEncryptionAvailable()) {
    return { ok: false, error: 'safeStorage no disponible en este sistema' };
  }
  try {
    const enc = safeStorage.encryptString(plain).toString('base64');
    const db = getDb();
    db.insert(schema.aiKeys)
      .values({ provider, encryptedKey: enc, customEndpoint: customEndpoint ?? null })
      .onConflictDoUpdate({
        target: schema.aiKeys.provider,
        set: { encryptedKey: enc, customEndpoint: customEndpoint ?? null },
      })
      .run();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'encrypt error' };
  }
}

export function loadKey(provider: ProviderId): { key: string; customEndpoint: string | null } | null {
  try {
    const row = getDb().select().from(schema.aiKeys).where(eq(schema.aiKeys.provider, provider)).get();
    if (!row) return null;
    const buf = Buffer.from(row.encryptedKey, 'base64');
    const key = safeStorage.decryptString(buf);
    return { key, customEndpoint: row.customEndpoint };
  } catch {
    return null;
  }
}

export function deleteKey(provider: ProviderId): void {
  getDb().delete(schema.aiKeys).where(eq(schema.aiKeys.provider, provider)).run();
}

export function configuredProviders(): ProviderId[] {
  return getDb()
    .select({ p: schema.aiKeys.provider })
    .from(schema.aiKeys)
    .all()
    .map((r) => r.p as ProviderId);
}
