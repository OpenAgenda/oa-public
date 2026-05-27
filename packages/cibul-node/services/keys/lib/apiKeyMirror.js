import { hashApiKey } from '@openagenda/auth';

// D2 — dual-write + backfill of the legacy `key` table into the better-auth
// `apikey` store (D1). The legacy path stays authoritative and is the only one
// read until D3; this only keeps `apikey` complete and concordant so the D3
// bascule has nothing to reconcile.
//
// Keys are stored hashed (SHA-256/base64url, the exact transform the plugin's
// verifyApiKey applies), so the existing plaintext keeps verifying once the
// read path flips. The hash is deterministic, which makes both the dual-write
// upsert and the backfill idempotent.

const KIND_BY_TYPE = {
  userPublic: 'pk',
  userPrivate: 'sk',
  agendaFullRead: 'agenda',
};

const LEGACY_TYPES = Object.keys(KIND_BY_TYPE);

function referenceIdFor(kind, identifier) {
  return kind === 'agenda' ? `agenda:${identifier}` : String(identifier);
}

// Match the mirror rows for one (owner, kind). Legacy is single-pair per user
// and the agenda key is per-agenda, so this is the natural replace/revoke unit.
// Scoped to mirror-sourced rows via `metadata.source` so future plugin-native
// keys (D3 multi-key) are never touched.
function whereMirrorRow(query, referenceId, kind) {
  return query
    .where({ reference_id: referenceId })
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.oaKind')) = ?", [kind])
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.source')) = 'mirror'");
}

async function mirrorOne(knex, apiKeyTable, legacyKey, type) {
  const kind = KIND_BY_TYPE[type];
  if (!kind) return; // not a key we mirror

  const referenceId = referenceIdFor(kind, legacyKey.identifier);
  const hashed = await hashApiKey(legacyKey.key);
  const now = new Date();

  const row = {
    config_id: 'default',
    name: legacyKey.label ?? null,
    start: null, // legacy values are bare (no oa_ prefix) → nothing to preview
    reference_id: referenceId,
    prefix: null,
    key: hashed,
    enabled: true,
    rate_limit_enabled: false, // legacy keys had no rate limit — preserve exactly
    request_count: 0,
    created_at: now,
    updated_at: now,
    // No per-resource scopes: legacy keys are ungated today (they authenticate
    // as the user; the user's role governs every resource). The effective cap
    // is the tier, carried by `metadata.oaKind` and applied at request time
    // (D6: pk → public/read-only, sk → owner read+write, agenda → admin). Bare
    // resource scopes are a new-key feature (D3+) where the owner opts in.
    permissions: null,
    metadata: JSON.stringify({
      oaKind: kind,
      legacyType: type,
      source: 'mirror',
    }),
  };

  await knex.transaction(async (trx) => {
    await whereMirrorRow(trx(apiKeyTable), referenceId, kind).delete();
    await trx(apiKeyTable).insert(row);
  });
}

async function removeMirror(knex, apiKeyTable, { type, identifier }) {
  const kind = KIND_BY_TYPE[type];
  if (!kind) return;
  await whereMirrorRow(
    knex(apiKeyTable),
    referenceIdFor(kind, identifier),
    kind,
  ).delete();
}

// One-shot reconciliation from the authoritative `key` table. `api_key_set` is
// a derived mirror of the user keys and carries no value absent from `key`, so
// `key` alone is the complete source. Idempotent: re-running replaces.
export async function backfillFromKeyTable({ knex, schemas }) {
  const apiKeyTable = schemas.apiKey;
  const rows = await knex(schemas.key)
    .whereIn('type', LEGACY_TYPES)
    .select('type', 'identifier', 'key', 'label');

  for (const row of rows) {
    await mirrorOne(knex, apiKeyTable, row, row.type);
  }

  return rows.length;
}

// Delete every mirror-sourced row (used by the backfill migration's `down`).
export function removeAllMirrored({ knex, schemas }) {
  return knex(schemas.apiKey)
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.source')) = 'mirror'")
    .delete();
}

export default function createApiKeyMirror(config) {
  const { knex, schemas } = config;
  const apiKeyTable = schemas.apiKey;

  return {
    // `created` is the camelCased row returned by the keys service create()
    // ({ type, identifier, key, label }).
    upsert: (created) => mirrorOne(knex, apiKeyTable, created, created.type),
    remove: (identifiers) => removeMirror(knex, apiKeyTable, identifiers),
  };
}
