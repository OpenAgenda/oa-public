// Sentinel format for legacy OA password hashes stored in `account.password`:
//   - SHA-256(salt + password) → `legacy-sha256$<salt>$<hex>`
//   - SHA-1  (salt + password) → `legacy-sha1$<salt>$<hex>`
// New writes (signup, password change, lazy rehash) use argon2id and produce
// a PHC string starting with `$argon2id$`. The verifier routes by prefix.

import { createHash, timingSafeEqual } from 'node:crypto';
import argon2 from 'argon2';

export const LEGACY_SHA256 = 'legacy-sha256';
export const LEGACY_SHA1 = 'legacy-sha1';
export const ARGON2ID_PREFIX = '$argon2id$';

export function encodeLegacy(algo, salt, hex) {
  if (algo === 'sha256') return `${LEGACY_SHA256}$${salt}$${hex}`;
  if (algo === 'sha1') return `${LEGACY_SHA1}$${salt}$${hex}`;
  throw new Error(`encodeLegacy: unsupported algo ${algo}`);
}

export function parseLegacy(encoded) {
  if (typeof encoded !== 'string') return null;
  const firstSep = encoded.indexOf('$');
  if (firstSep < 0) return null;
  const prefix = encoded.slice(0, firstSep);
  let algo;
  if (prefix === LEGACY_SHA256) algo = 'sha256';
  else if (prefix === LEGACY_SHA1) algo = 'sha1';
  else return null;
  const rest = encoded.slice(firstSep + 1);
  const secondSep = rest.indexOf('$');
  if (secondSep < 0) return null;
  return {
    algo,
    salt: rest.slice(0, secondSep),
    hex: rest.slice(secondSep + 1),
  };
}

export function isLegacy(stored) {
  return parseLegacy(stored) !== null;
}

export async function hash(password) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verify({ hash: stored, password }) {
  if (typeof stored !== 'string' || typeof password !== 'string') return false;
  if (stored.startsWith(ARGON2ID_PREFIX)) {
    return argon2.verify(stored, password);
  }
  const parsed = parseLegacy(stored);
  if (!parsed) return false;
  const computed = createHash(parsed.algo)
    .update(parsed.salt + password, 'utf-8')
    .digest('hex');
  if (computed.length !== parsed.hex.length) return false;
  return timingSafeEqual(
    Buffer.from(computed, 'hex'),
    Buffer.from(parsed.hex, 'hex'),
  );
}
