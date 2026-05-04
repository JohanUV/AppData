import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../src/lib/db/schema';
import { badgeSeeds } from '../../src/lib/db/badges-data';

export function seedBadges(db: BetterSQLite3Database<typeof schema>): void {
  // INSERT OR IGNORE: idempotente, no pisa modificaciones manuales.
  // 30 inserts al boot — sin prepared statements para no chocar con la
  // serialización JSON de Drizzle.
  for (const b of badgeSeeds) {
    db.insert(schema.badges)
      .values({
        slug: b.slug,
        icon: b.icon,
        tier: b.tier,
        nameTranslations: b.name,
        descriptionTranslations: b.description,
        criteria: b.criteria,
      })
      .onConflictDoNothing()
      .run();
  }
}

export function ensureDefaultUser(db: BetterSQLite3Database<typeof schema>): schema.User {
  const existing = db.select().from(schema.users).limit(1).all();
  if (existing[0]) return existing[0];

  const result = db
    .insert(schema.users)
    .values({ name: 'Tú', avatar: null })
    .returning()
    .get();

  return result;
}
