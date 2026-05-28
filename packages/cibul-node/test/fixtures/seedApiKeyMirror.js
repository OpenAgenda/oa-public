import { hashApiKey } from '@openagenda/auth';

// After D5a removed the live dual-write mirror, fixtures that seed legacy
// `api_key_set` rows are not enough on their own — the v2 auth middleware
// (and any other `?key=` reader) verifies against the `apikey` store. This
// helper hashes the legacy plaintext keys (api_key / api_secret) and inserts
// them into `apikey` so tests using those legacy keys keep authenticating.
//
// Runs at the tail of `setup()`, inside the same transaction as the fixture
// inserts, so all the api_key_set rows are visible. Idempotent enough for
// tests: setup wipes the DB to the template state before each beforeAll, so
// the inserts never collide.
export default async function seedApiKeyMirror(knex) {
  const sets = await knex('api_key_set').select(
    'user_id',
    'api_key',
    'api_secret',
  );
  if (sets.length === 0) return;

  // `referenceId` is keyed by user uid (the `apikey` store convention), but
  // `api_key_set.user_id` is the user *id*. Resolve the uid for every set
  // owner in one query.
  const userIds = sets.map((s) => s.user_id);
  const users = await knex('user').select('id', 'uid').whereIn('id', userIds);
  const uidById = new Map(users.map((u) => [u.id, u.uid]));

  const now = new Date();
  const rows = [];
  for (const set of sets) {
    const uid = uidById.get(set.user_id);
    if (!uid) continue;
    const referenceId = String(uid);

    if (set.api_key) {
      rows.push({
        config_id: 'default',
        name: null,
        start: set.api_key,
        reference_id: referenceId,
        prefix: null,
        key: await hashApiKey(set.api_key),
        enabled: true,
        rate_limit_enabled: false,
        request_count: 0,
        created_at: now,
        updated_at: now,
        permissions: null,
        metadata: JSON.stringify({ oaKind: 'pk' }),
      });
    }
    if (set.api_secret) {
      rows.push({
        config_id: 'default',
        name: null,
        start: set.api_secret,
        reference_id: referenceId,
        prefix: null,
        key: await hashApiKey(set.api_secret),
        enabled: true,
        rate_limit_enabled: false,
        request_count: 0,
        created_at: now,
        updated_at: now,
        permissions: null,
        metadata: JSON.stringify({ oaKind: 'sk' }),
      });
    }
  }

  if (rows.length) {
    await knex(knex.client.config.schemas.apiKey).insert(rows);
  }
}
