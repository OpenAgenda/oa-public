// Sentinel format for legacy OA password hashes stored in `account.password`:
//   - SHA-256(salt + password) → `legacy-sha256$<salt>$<hex>`
//   - SHA-1  (salt + password) → `legacy-sha1$<salt>$<hex>`
// Phase 2b adds a verifier that routes by prefix and rehashes to argon2id on
// successful sign-in. Keeping format definition in one place avoids drift.

export const LEGACY_SHA256 = 'legacy-sha256';
export const LEGACY_SHA1 = 'legacy-sha1';

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
