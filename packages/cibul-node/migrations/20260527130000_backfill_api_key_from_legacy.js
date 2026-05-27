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

// `transaction: false`: mirrorOne wraps each row's delete+insert in its own
// knex.transaction() — the same per-key atomicity the runtime dual-write path
// uses. Inside knex's default per-migration transaction those nest as MySQL
// SAVEPOINTs, which the implicit commit from the api_key CREATE TABLE earlier in
// the batch invalidates → a "do not mix transactions and DDL (#805)" warning per
// row. Opting out lets mirrorOne open real top-level transactions, exactly as it
// does at runtime. The backfill stays safe to re-run on partial failure: the
// deterministic hash + replace make it idempotent.
export const config = { transaction: false };

export async function up(knex) {
  const { schemas } = knex.client.config;
  await backfillFromKeyTable({ knex, schemas });
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  await removeAllMirrored({ knex, schemas });
}
