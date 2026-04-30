// Backfill `user.password` (+ `user.salt`) into `account.password`, encoded
// as a sentinel string so `password.verify` can route by prefix:
//   - SHA-256 hex (64 chars) → `legacy-sha256$<salt>$<hex>`
//   - SHA-1   hex (40 chars) → `legacy-sha1$<salt>$<hex>`
//
// Phase 2a already dual-writes new credentials. This migration covers users
// created before 2a was deployed. Idempotent via the unique index on
// (provider_id, account_id) — re-runs and overlap with 2a writes are no-ops.
// Once a user signs in, the /sign-in/email after-hook rotates the row to
// argon2id in place.

import { LEGACY_SHA1, LEGACY_SHA256, encodeLegacy } from '../src/password.js';

// Chunked INSERT to stay under MySQL's max_allowed_packet — the migration
// itself runs in a single auto-wrapped transaction.
const INSERT_CHUNK = 1000;

function detectAlgo(hash) {
  if (hash.length === 64) return 'sha256';
  if (hash.length === 40) return 'sha1';
  return null;
}

export async function up(knex) {
  const { schemas } = knex.client.config;
  const { user, account } = schemas;

  const rows = await knex(user)
    .select('id', 'password', 'salt')
    .whereNotNull('password')
    .where('is_removed', 0);

  const now = new Date();
  const inserts = [];
  for (const row of rows) {
    const algo = detectAlgo(row.password);
    if (!algo) continue;
    inserts.push({
      user_id: row.id,
      account_id: String(row.id),
      provider_id: 'credential',
      password: encodeLegacy(algo, row.salt ?? '', row.password),
      created_at: now,
      updated_at: now,
    });
  }

  for (let i = 0; i < inserts.length; i += INSERT_CHUNK) {
    await knex(account)
      .insert(inserts.slice(i, i + INSERT_CHUNK))
      .onConflict(['provider_id', 'account_id'])
      .ignore();
  }
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  await knex(schemas.account)
    .where('provider_id', 'credential')
    .andWhere((qb) => {
      qb.where('password', 'like', `${LEGACY_SHA1}$%`).orWhere(
        'password',
        'like',
        `${LEGACY_SHA256}$%`,
      );
    })
    .delete();
}
