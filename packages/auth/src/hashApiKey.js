import { defaultKeyHasher } from '@better-auth/api-key';

// Deterministic SHA-256 → base64url hash, byte-for-byte identical to what the
// api-key plugin's `verifyApiKey` applies to an incoming key before lookup.
// Exported standalone (no better-auth instance, no DB) so the dual-write
// mirror and the backfill migration can pre-hash legacy plaintext and have it
// resolve through the same verification path later.
export default function hashApiKey(key) {
  return defaultKeyHasher(key);
}
