import { encodeCursor, decodeCursor } from '../api-v3/lib/cursor.js';

describe('90 - api-v3 unit - cursor', () => {
  describe('round-trip', () => {
    it('encodes then decodes back to the same { after, sort }', () => {
      const after = ['1727424000000', '1'];
      const sort = 'timingsWithFeatured.asc';
      const cursor = encodeCursor({ after, sort });

      expect(typeof cursor).toBe('string');
      expect(decodeCursor(cursor)).toEqual({ after, sort });
    });

    it('produces an opaque (non-JSON, base64url) string', () => {
      const cursor = encodeCursor({ after: ['a', 'b'], sort: 'x' });
      expect(cursor).not.toContain('[');
      expect(cursor).not.toContain('{');
      // base64url alphabet only
      expect(cursor).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('defaults missing sort to null on round-trip', () => {
      const cursor = encodeCursor({ after: ['a'] });
      expect(decodeCursor(cursor)).toEqual({ after: ['a'], sort: null });
    });
  });

  describe('last page handling', () => {
    it('encodes null after as null (no cursor)', () => {
      expect(encodeCursor({ after: null, sort: 'x' })).toBeNull();
      expect(encodeCursor({ after: undefined, sort: 'x' })).toBeNull();
    });

    it('decodes null/empty cursor as null', () => {
      expect(decodeCursor(null)).toBeNull();
      expect(decodeCursor(undefined)).toBeNull();
      expect(decodeCursor('')).toBeNull();
    });
  });

  describe('invalid cursors', () => {
    it('throws BadRequest on garbage input', () => {
      expect(() => decodeCursor('not-base64-or-json!!!')).toThrow();
    });

    it('throws BadRequest when decoded shape lacks an after array', () => {
      const bad = Buffer.from(JSON.stringify({ sort: 'x' }), 'utf8').toString(
        'base64url',
      );
      expect(() => decodeCursor(bad)).toThrow();
    });
  });
});
