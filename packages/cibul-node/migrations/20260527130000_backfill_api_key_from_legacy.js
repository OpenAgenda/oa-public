// D2 backfill: hash every existing legacy `key` (userPublic / userPrivate /
// agendaFullRead) into the better-auth `apikey` store created in D1. Runs after
// the `apikey` table migration (20260527120000 < 20260527130000) and after the
// 2017 `key` table. Cross-service: it bridges the keys-owned `key` table and
// the auth-owned `apikey` table, hence its home in cibul-node/migrations.
//
// Idempotent (deterministic hash + replace), so safe to re-run before the D3
// bascule to catch keys created between deploys.

import {
  backfillFromKeyTable,
  removeAllMirrored,
} from '../services/keys/lib/apiKeyMirror.js';

export async function up(knex) {
  const { schemas } = knex.client.config;
  await backfillFromKeyTable({ knex, schemas });
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  await removeAllMirrored({ knex, schemas });
}
