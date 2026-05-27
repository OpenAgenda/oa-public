// OA helpers over the better-auth api-key plugin (`@better-auth/api-key`).
//
// `hashApiKey` is a pure static (no instance, no DB) — re-exported from the
// package root like `toNodeHandler`/`fromNodeHeaders`, so the dual-write mirror
// and the backfill migration can pre-hash legacy plaintext.
//
// `createApiKeyHelpers(instance)` mirrors `createCredentialHelpers(instance)`:
// a factory that closes over the better-auth instance and returns the
// instance-bound façade family. It grows here (D3b: createUserKeyPair,
// createAgendaKey, listKeys, revokeKey) so the OA referenceId/scope conventions
// live in one place. Spread into the object `Auth()` returns, callers write
// `auth.verifyKey(key)` instead of threading the instance.

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
const AGENDA_PREFIX = 'agenda:';
// Strict decimal uid. Not Number(): that maps '' / whitespace to 0, and would
// accept '0x10' / '1e3' / negatives — turning a malformed referenceId into a
// real-looking identity at this string→owner boundary.
const UID = /^\d+$/;

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

  return { verifyKey };
}
