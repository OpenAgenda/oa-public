import buildLocationListQuery from '../api-v3/lib/buildLocationListQuery.js';

describe('90 - api-v3 unit - buildLocationListQuery', () => {
  it('returns an empty query for no parameters', () => {
    expect(buildLocationListQuery({})).toEqual({});
  });

  it('ignores route-owned parameters (after/limit/detailed) and unknown ones', () => {
    expect(
      buildLocationListQuery({
        after: 'abc',
        limit: '50',
        detailed: 'true',
        somethingElse: 'x',
      }),
    ).toEqual({});
  });

  describe('search', () => {
    it('passes a text search through', () => {
      expect(buildLocationListQuery({ search: 'château' })).toEqual({
        search: 'château',
      });
    });

    it('does NOT rewrite an all-digits search into a uid filter (v2 quirk)', () => {
      expect(buildLocationListQuery({ search: '12345' })).toEqual({
        search: '12345',
      });
    });

    it('rejects a non-scalar search', () => {
      expect(() => buildLocationListQuery({ search: ['a', 'b'] })).toThrow(
        'Invalid query parameters',
      );
    });

    it('rejects a search over 255 characters (the service cap), in the gate shape', () => {
      expect(() => buildLocationListQuery({ search: 'x'.repeat(256) })).toThrow(
        'Invalid query parameters',
      );
    });
  });

  describe('uid', () => {
    it('maps single and repeated uid to the uids list', () => {
      expect(buildLocationListQuery({ uid: '123' })).toEqual({ uids: [123] });
      expect(buildLocationListQuery({ uid: ['123', '456'] })).toEqual({
        uids: [123, 456],
      });
    });

    it('rejects non-integer uids', () => {
      expect(() => buildLocationListQuery({ uid: 'abc' })).toThrow(
        'Invalid query parameters',
      );
    });

    it('rejects blank uids instead of coercing them to 0', () => {
      // `Number('')` and `Number(' ')` are 0: a dangling `uid=` must fail the
      // gate, not silently filter on uid 0 (empty result page).
      expect(() => buildLocationListQuery({ uid: '' })).toThrow(
        'Invalid query parameters',
      );
      expect(() => buildLocationListQuery({ uid: ' ' })).toThrow(
        'Invalid query parameters',
      );
      expect(() => buildLocationListQuery({ uid: ['1', ''] })).toThrow(
        'Invalid query parameters',
      );
    });
  });

  describe('extId', () => {
    it('requires both key and value', () => {
      expect(
        buildLocationListQuery({ extId: { key: 'import', value: 'loc-42' } }),
      ).toEqual({ extId: { key: 'import', value: 'loc-42' } });

      expect(() =>
        buildLocationListQuery({ extId: { key: 'import' } })).toThrow('Invalid query parameters');
      expect(() => buildLocationListQuery({ extId: 'import' })).toThrow(
        'Invalid query parameters',
      );
    });

    it('rejects unknown extId properties', () => {
      expect(() =>
        buildLocationListQuery({
          extId: { key: 'a', value: 'b', extra: 'c' },
        })).toThrow('Invalid query parameters');
    });
  });

  describe('bbox', () => {
    it('parses west,south,east,north into the service geo box', () => {
      expect(
        buildLocationListQuery({ bbox: '2.224,48.815,2.469,48.902' }),
      ).toEqual({
        geo: {
          northEast: { lat: 48.902, lng: 2.469 },
          southWest: { lat: 48.815, lng: 2.224 },
        },
      });
    });

    it('rejects a malformed bbox', () => {
      expect(() => buildLocationListQuery({ bbox: '1,2,3' })).toThrow(
        'Invalid query parameters',
      );
      expect(() => buildLocationListQuery({ bbox: 'a,b,c,d' })).toThrow(
        'Invalid query parameters',
      );
    });

    it('rejects out-of-range coordinates', () => {
      expect(() =>
        buildLocationListQuery({ bbox: '2.2,98.8,2.4,48.9' })).toThrow('Invalid query parameters');
    });

    it('rejects blank coordinates instead of coercing them to 0', () => {
      // `Number(' ')` is 0 — a blank component must not silently stretch the
      // box to the equator/meridian.
      expect(() => buildLocationListQuery({ bbox: '2.2, ,2.4,48.9' })).toThrow(
        'Invalid query parameters',
      );
    });
  });

  describe('date ranges', () => {
    it('parses createdAt/updatedAt bounds into Dates', () => {
      const query = buildLocationListQuery({
        createdAt: { gte: '2026-01-01T00:00:00Z' },
        updatedAt: { lte: '2026-06-01T00:00:00Z' },
      });
      expect(query.createdAt.gte).toEqual(new Date('2026-01-01T00:00:00Z'));
      expect(query.updatedAt.lte).toEqual(new Date('2026-06-01T00:00:00Z'));
    });

    it('accepts a bare date (read as UTC midnight)', () => {
      const query = buildLocationListQuery({
        createdAt: { gte: '2026-01-01' },
      });
      expect(query.createdAt.gte).toEqual(new Date('2026-01-01T00:00:00Z'));
    });

    it('rejects unknown bounds and non-dates', () => {
      expect(() =>
        buildLocationListQuery({ createdAt: { eq: '2026-01-01' } })).toThrow('Invalid query parameters');
      expect(() =>
        buildLocationListQuery({ createdAt: { gt: '2026-01-01' } })).toThrow('Invalid query parameters');
      expect(() =>
        buildLocationListQuery({ updatedAt: { gte: 'not-a-date' } })).toThrow('Invalid query parameters');
      expect(() => buildLocationListQuery({ createdAt: '2026-01-01' })).toThrow(
        'Invalid query parameters',
      );
    });

    it('rejects lax inputs Date.parse would let through', () => {
      // Strict RFC 3339: no month-name forms, no year-only strings, and no
      // offset-less date-times (ES reads those as UTC where SQL would read
      // server-local time).
      for (const raw of ['March 13 2024', '1', '2026-01-15T10:00:00']) {
        expect(() =>
          buildLocationListQuery({ createdAt: { gte: raw } })).toThrow('Invalid query parameters');
      }
    });
  });

  it('aggregates all field errors into one BadRequest', () => {
    let caught;
    try {
      buildLocationListQuery({
        uid: 'abc',
        bbox: '1,2,3',
        createdAt: { eq: 'x' },
      });
    } catch (err) {
      caught = err;
    }
    expect(caught?.name).toBe('BadRequest');
    expect(caught?.info.errors.length).toBeGreaterThanOrEqual(3);
  });
});
