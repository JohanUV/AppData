import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../../src/lib/db/schema';
import type { AIMessage } from '../../src/lib/db/schema';
import type { ProviderId } from '../../src/lib/ai/providers-meta';

const MAX_HISTORY = 30; // máximo de mensajes a mantener (sin contar system).

export function getConversation(userId: number, lessonSlug: string): schema.AIConversation | null {
  return (
    getDb()
      .select()
      .from(schema.aiConversations)
      .where(
        and(
          eq(schema.aiConversations.userId, userId),
          eq(schema.aiConversations.lessonSlug, lessonSlug),
        ),
      )
      .get() ?? null
  );
}

export function upsertConversation(
  userId: number,
  lessonSlug: string,
  provider: ProviderId,
  model: string,
  messages: AIMessage[],
): schema.AIConversation {
  const db = getDb();
  const trimmed = trimHistory(messages);
  const now = new Date();
  const existing = getConversation(userId, lessonSlug);

  if (!existing) {
    return db
      .insert(schema.aiConversations)
      .values({
        userId,
        lessonSlug,
        provider,
        model,
        messages: trimmed,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
  }

  return db
    .update(schema.aiConversations)
    .set({ provider, model, messages: trimmed, updatedAt: now })
    .where(eq(schema.aiConversations.id, existing.id))
    .returning()
    .get();
}

export function clearConversation(userId: number, lessonSlug: string): void {
  getDb()
    .delete(schema.aiConversations)
    .where(
      and(
        eq(schema.aiConversations.userId, userId),
        eq(schema.aiConversations.lessonSlug, lessonSlug),
      ),
    )
    .run();
}

/**
 * Recorta el historial: conserva los últimos N mensajes, manteniendo el system
 * prompt al frente (si existe). Compresión más sofisticada (resumir el inicio
 * con el LLM) llegará en una iteración posterior.
 */
function trimHistory(messages: AIMessage[]): AIMessage[] {
  if (messages.length <= MAX_HISTORY) return messages;
  const system = messages.find((m) => m.role === 'system');
  const tail = messages.slice(-MAX_HISTORY);
  if (system && !tail.some((m) => m.role === 'system')) return [system, ...tail];
  return tail;
}
