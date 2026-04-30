import { createHash } from 'node:crypto';
import {
  hash,
  verify,
  isLegacy,
  encodeLegacy,
  ARGON2ID_PREFIX,
} from '../src/password.js';

function legacyVector(algo, salt, password) {
  const hex = createHash(algo)
    .update(salt + password, 'utf-8')
    .digest('hex');
  return encodeLegacy(algo, salt, hex);
}

describe('auth - unit: password hash + verify', () => {
  describe('hash', () => {
    it('produces an argon2id PHC string', async () => {
      const out = await hash('s3cret');
      expect(out.startsWith(ARGON2ID_PREFIX)).toBe(true);
    });

    it('produces distinct hashes for the same password (random salt)', async () => {
      const a = await hash('s3cret');
      const b = await hash('s3cret');
      expect(a).not.toBe(b);
    });
  });

  describe('verify - argon2id', () => {
    it('accepts the matching password', async () => {
      const stored = await hash('s3cret');
      await expect(verify({ hash: stored, password: 's3cret' })).resolves.toBe(
        true,
      );
    });

    it('rejects a mismatched password', async () => {
      const stored = await hash('s3cret');
      await expect(verify({ hash: stored, password: 'wrong' })).resolves.toBe(
        false,
      );
    });
  });

  describe('verify - legacy sha256', () => {
    it('accepts the matching password', async () => {
      const stored = legacyVector('sha256', 'abc12345', 'p@ss');
      await expect(verify({ hash: stored, password: 'p@ss' })).resolves.toBe(
        true,
      );
    });

    it('rejects a mismatched password', async () => {
      const stored = legacyVector('sha256', 'abc12345', 'p@ss');
      await expect(verify({ hash: stored, password: 'nope' })).resolves.toBe(
        false,
      );
    });
  });

  describe('verify - legacy sha1', () => {
    it('accepts the matching password', async () => {
      const stored = legacyVector('sha1', 'salty', 'hunter2');
      await expect(verify({ hash: stored, password: 'hunter2' })).resolves.toBe(
        true,
      );
    });

    it('rejects a mismatched password', async () => {
      const stored = legacyVector('sha1', 'salty', 'hunter2');
      await expect(verify({ hash: stored, password: 'nope' })).resolves.toBe(
        false,
      );
    });
  });

  describe('verify - rejected formats', () => {
    it('rejects an unknown prefix', async () => {
      await expect(verify({ hash: 'plaintext', password: 'x' })).resolves.toBe(
        false,
      );
    });

    it('rejects an empty hash', async () => {
      await expect(verify({ hash: '', password: 'x' })).resolves.toBe(false);
    });

    it('rejects non-string inputs', async () => {
      await expect(verify({ hash: null, password: 'x' })).resolves.toBe(false);
      await expect(verify({ hash: 'x', password: null })).resolves.toBe(false);
    });
  });

  describe('isLegacy', () => {
    it('returns true for legacy-sha256', () => {
      expect(isLegacy('legacy-sha256$s$h')).toBe(true);
    });

    it('returns true for legacy-sha1', () => {
      expect(isLegacy('legacy-sha1$s$h')).toBe(true);
    });

    it('returns false for an argon2id PHC string', async () => {
      const stored = await hash('s3cret');
      expect(isLegacy(stored)).toBe(false);
    });

    it('returns false for unknown formats', () => {
      expect(isLegacy('plaintext')).toBe(false);
      expect(isLegacy('')).toBe(false);
      expect(isLegacy(null)).toBe(false);
    });
  });
});
