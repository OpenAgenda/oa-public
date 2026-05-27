// OA helpers over the better-auth api-key plugin (`@better-auth/api-key`).
//
// `hashApiKey` is a pure static (no instance, no DB) — re-exported from the
// package root like `toNodeHandler`/`fromNodeHeaders`, so the dual-write mirror
// and the backfill migration can pre-hash legacy plaintext.
//
// `createApiKeyHelpers(instance)` mirrors `createCredentialHelpers(instance)`:
// a factory that closes over the better-auth instance and returns the
// instance-bound façade family (verify / create / list / revoke), so the OA
// referenceId encoding and the apikey-store ownership live in one place. Spread
// into the object `Auth()` returns, callers write `auth.verifyKey(key)` etc.
//
// list/revoke go through `instance.$context.adapter` (model 'apikey'), NOT the
// plugin's `/api-key/list` and `/api-key/delete` endpoints — those are
// session-gated (own-key only, keyed on session.user.id), so they can neither
// run server-side nor address agenda keys (referenceId `agenda:<uid>`). The
// adapter is the same escape hatch `createCredentialHelpers` uses for accounts;
// it respects the plugin's schema map (model 'apikey' → OA table/columns), so
// no physical column names are hardcoded here.

import { defaultKeyHasher } from '@better-auth/api-key';

// Deterministic SHA-256 → base64url hash, byte-for-byte identical to what the
// plugin's `verifyApiKey` applies to an incoming key before lookup. No instance
// and no DB, so the dual-write mirror and the backfill can pre-hash legacy
// plaintext and have it resolve through the same verification path later.
export function hashApiKey(key) {
  return defaultKeyHasher(key);
}

// `referenceId` encoding (set by the D2 mirror and by D3+ key creation):
//   user keys   -> "<uid>"          (oaKind 'pk' | 'sk')
//   agenda keys -> "agenda:<uid>"   (oaKind 'agenda')
// `createApiKey` has no `referenceId` field; with references:"user" (our config)
// a server-side call derives `referenceId` from `userId`, so we encode the owner
// into `userId` here — the same strings `resolveOwner` decodes on the way back.
const AGENDA_PREFIX = 'agenda:';
// Strict decimal uid. Not Number(): that maps '' / whitespace to 0, and would
// accept '0x10' / '1e3' / negatives — turning a malformed referenceId into a
// real-looking identity at this string→owner boundary.
const UID = /^\d+$/;

const userReferenceId = (uid) => String(uid);
const agendaReferenceId = (uid) => `${AGENDA_PREFIX}${uid}`;

function resolveOwner(referenceId) {
  if (referenceId == null) return null;
  if (referenceId.startsWith(AGENDA_PREFIX)) {
    const raw = referenceId.slice(AGENDA_PREFIX.length);
    return UID.test(raw) ? { kind: 'agenda', agendaUid: Number(raw) } : null;
  }
  return UID.test(referenceId)
    ? { kind: 'user', userUid: Number(referenceId) }
    : null;
}

export default function createApiKeyHelpers(instance) {
  // Verify a bare key value (the plaintext the caller received at creation) and
  // return a normalized owner descriptor, or `null` when the key is invalid /
  // unknown / revoked / expired. Owner *resolution* (loading the OA user/agenda
  // from `referenceId`) stays the caller's job, so this is reusable by every
  // auth path (v3 now, v2 later). Infra faults are NOT swallowed: `verifyApiKey`
  // throws and we let it propagate, so a genuine failure maps to a 500 rather
  // than being masked as a 401.
  async function verifyKey(key) {
    if (!key) return null;

    const { valid, key: record } = await instance.api.verifyApiKey({
      body: { key },
    });

    if (!valid || !record) return null;

    return {
      // Structural owner, from the referenceId encoding (authoritative even if
      // metadata is absent). `oaKind` is the visibility tier, enforced at D6.
      owner: resolveOwner(record.referenceId),
      oaKind: record.metadata?.oaKind ?? null,
      referenceId: record.referenceId ?? null,
      permissions: record.permissions ?? null,
      record,
    };
  }

  // Create one key in the apikey store for an OA owner. `oaKind` (pk|sk|agenda)
  // and the referenceId encoding are the OA convention this façade owns; the
  // rest (name, prefix, permissions, expiresIn) is policy the caller passes
  // through. Server-side call: `permissions`/`rateLimit*` are server-only in the
  // plugin, and `userId` becomes the `referenceId`. The plugin generates and
  // hashes the key, returning the plaintext ONCE — surfaced as `key`, with the
  // stored record (no plaintext) under `record`.
  async function createKey({
    referenceId,
    oaKind,
    name,
    prefix,
    permissions,
    expiresIn,
  }) {
    const { key, ...record } = await instance.api.createApiKey({
      body: {
        userId: referenceId,
        metadata: { oaKind, source: 'native' },
        ...name != null && { name },
        ...prefix != null && { prefix },
        ...permissions != null && { permissions },
        ...expiresIn != null && { expiresIn },
      },
    });
    return { key, record };
  }

  // A user's publishable (pk) + secret (sk) pair, the shape the legacy
  // generateApiKey flow produced. Each entry is `{ key, record }`.
  async function createUserKeyPair(userUid, { pk = {}, sk = {} } = {}) {
    const referenceId = userReferenceId(userUid);
    return {
      publicKey: await createKey({ referenceId, oaKind: 'pk', ...pk }),
      secretKey: await createKey({ referenceId, oaKind: 'sk', ...sk }),
    };
  }

  async function createAgendaKey(agendaUid, opts = {}) {
    return createKey({
      referenceId: agendaReferenceId(agendaUid),
      oaKind: 'agenda',
      ...opts,
    });
  }

  // Raw adapter — the escape hatch createCredentialHelpers uses, bypassing the
  // session-gated list/delete endpoints (see header).
  const getAdapter = async () => (await instance.$context).adapter;

  // List an owner's stored records, newest first. The `key` column (the stored
  // hash) is dropped: callers never need it, and it keeps list records free of
  // key material — consistent with what `createKey` returns (no plaintext, no
  // hash).
  async function listByReferenceId(referenceId) {
    const adapter = await getAdapter();
    const rows = await adapter.findMany({
      model: 'apikey',
      where: [{ field: 'referenceId', value: referenceId }],
      sortBy: { field: 'createdAt', direction: 'desc' },
    });
    return rows.map(({ key, ...record }) => record);
  }

  // Revoke one key, scoped to its owner: the lookup AND delete match on both id
  // and referenceId, so an authorization slip in a caller can't reach a key
  // owned by someone else. Returns whether a row was removed.
  async function revokeByReferenceId(referenceId, keyId) {
    const adapter = await getAdapter();
    const where = [
      { field: 'id', value: keyId },
      { field: 'referenceId', value: referenceId },
    ];
    const existing = await adapter.findOne({ model: 'apikey', where });
    if (!existing) return false;
    await adapter.delete({ model: 'apikey', where });
    return true;
  }

  const listUserKeys = (userUid) => listByReferenceId(userReferenceId(userUid));
  const listAgendaKeys = (agendaUid) =>
    listByReferenceId(agendaReferenceId(agendaUid));
  const revokeUserKey = (userUid, keyId) =>
    revokeByReferenceId(userReferenceId(userUid), keyId);
  const revokeAgendaKey = (agendaUid, keyId) =>
    revokeByReferenceId(agendaReferenceId(agendaUid), keyId);

  return {
    verifyKey,
    createUserKeyPair,
    createAgendaKey,
    listUserKeys,
    listAgendaKeys,
    revokeUserKey,
    revokeAgendaKey,
  };
}
