import buildEventSearchQuery from '../api-v3/lib/buildEventSearchQuery.js';

// Inputs mirror what `qs` (extended) produces from the query string: scalars are
// strings, repeated params are arrays, bracketed params are nested objects.

// Run the translator expecting a 400, and return the offending field names so
// each test can assert on them directly.
function badRequestFields(rawQuery) {
  let thrown;
  try {
    buildEventSearchQuery(rawQuery);
  } catch (err) {
    thrown = err;
  }
  if (!thrown) {
    throw new Error('expected a BadRequest, but nothing was thrown');
  }
  if (thrown.name !== 'BadRequest') {
    throw thrown;
  }
  return (thrown.info?.errors ?? []).map((e) => e.field);
}

describe('90 - api-v3 unit - buildEventSearchQuery', () => {
  describe('valid mappings', () => {
    it('returns an empty query when no filters are given', () => {
      expect(buildEventSearchQuery({})).toEqual({});
    });

    it('ignores pagination params', () => {
      expect(buildEventSearchQuery({ after: 'abc', limit: '20' })).toEqual({});
    });

    it('maps text & identity filters', () => {
      expect(
        buildEventSearchQuery({
          search: 'jazz',
          uid: ['1', '2'],
          slug: 'my-event',
          extId: { key: 'sys', value: '42' },
        }),
      ).toEqual({
        search: 'jazz',
        uid: [1, 2],
        slug: ['my-event'],
        extId: { key: 'sys', value: '42' },
      });
    });

    it('renames language -> languages and keeps keyword AND-list', () => {
      expect(
        buildEventSearchQuery({ language: ['fr', 'en'], keyword: ['a', 'b'] }),
      ).toEqual({ languages: ['fr', 'en'], keyword: ['a', 'b'] });
    });

    it('maps classification enums to integers/strings', () => {
      expect(
        buildEventSearchQuery({
          status: ['1', '6'],
          attendanceMode: '2',
          accessibility: ['hi', 'vi'],
          featured: 'true',
        }),
      ).toEqual({
        status: [1, 6],
        attendanceMode: [2],
        accessibility: ['hi', 'vi'],
        featured: true,
      });
    });

    it('upper-cases country codes', () => {
      expect(buildEventSearchQuery({ countryCode: ['fr', 'BE'] })).toEqual({
        countryCode: ['FR', 'BE'],
      });
    });

    it('maps a bounding box to core geo', () => {
      expect(
        buildEventSearchQuery({ bbox: '2.224,48.815,2.469,48.902' }),
      ).toEqual({
        geo: {
          northEast: { lat: 48.902, lng: 2.469 },
          southWest: { lat: 48.815, lng: 2.224 },
        },
      });
    });

    it('maps near + radius to core geoDistance', () => {
      expect(
        buildEventSearchQuery({ near: '48.85,2.35', radius: '5000' }),
      ).toEqual({
        geoDistance: { center: { lat: 48.85, lng: 2.35 }, distance: 5000 },
      });
    });

    it('nests origin agenda filters', () => {
      expect(
        buildEventSearchQuery({
          originAgendaUid: ['7', '8'],
          originAgendaOfficial: 'false',
        }),
      ).toEqual({ originAgenda: { uid: [7, 8], official: false } });
    });

    it('maps time ranges and relative', () => {
      expect(
        buildEventSearchQuery({
          relative: ['upcoming', 'current'],
          timings: { gte: '2026-01-01T00:00:00Z' },
          updatedAt: {
            gte: '2026-05-01T00:00:00Z',
            lte: '2026-05-31T00:00:00Z',
          },
          localTime: { gte: '480', lte: '1200' },
          age: { gte: '7', lte: '12' },
        }),
      ).toEqual({
        relative: ['upcoming', 'current'],
        timings: { gte: '2026-01-01T00:00:00Z' },
        updatedAt: { gte: '2026-05-01T00:00:00Z', lte: '2026-05-31T00:00:00Z' },
        localTime: { gte: 480, lte: 1200 },
        age: { gte: 7, lte: 12 },
      });
    });

    it('maps sort', () => {
      expect(buildEventSearchQuery({ sort: 'updatedAt.desc' })).toEqual({
        sort: 'updatedAt.desc',
      });
    });
  });

  describe('visibility lock: moderation/internal params are never forwarded', () => {
    it('drops state, valid, removed, memberUid, ownerUid, addMethod, set', () => {
      expect(
        buildEventSearchQuery({
          state: '1',
          valid: 'true',
          removed: 'true',
          memberUid: '3',
          ownerUid: '4',
          ownerOrMemberUid: '5',
          addMethod: 'aggregation',
          referencingAgendaUid: '9',
          set: 'foo',
          mlt: 'bar',
          custom: { theme: '2' },
        }),
      ).toEqual({});
    });
  });

  describe('strict validation (400 with per-field details)', () => {
    it('rejects a non-integer uid', () => {
      expect(badRequestFields({ uid: 'abc' })).toContain('uid');
    });

    it('rejects an unknown status enum value', () => {
      expect(badRequestFields({ status: '99' })).toContain('status');
    });

    it('rejects an unknown accessibility value', () => {
      expect(badRequestFields({ accessibility: 'zz' })).toContain(
        'accessibility',
      );
    });

    it('rejects an unknown sort value', () => {
      expect(badRequestFields({ sort: 'title.asc' })).toContain('sort');
    });

    it('rejects a non-boolean featured', () => {
      expect(badRequestFields({ featured: 'maybe' })).toContain('featured');
    });

    it('rejects featured given multiple times', () => {
      expect(badRequestFields({ featured: ['true', 'false'] })).toContain(
        'featured',
      );
    });

    it('rejects a bad country code', () => {
      expect(badRequestFields({ countryCode: 'FRA' })).toContain('countryCode');
    });

    it('rejects a malformed bbox', () => {
      expect(badRequestFields({ bbox: '1,2,3' })).toContain('bbox');
    });

    it('rejects out-of-range bbox coordinates', () => {
      expect(badRequestFields({ bbox: '2.2,48.8,2.4,200' })).toContain('bbox');
    });

    it('rejects near without radius', () => {
      expect(badRequestFields({ near: '48.85,2.35' })).toContain('radius');
    });

    it('rejects radius without near', () => {
      expect(badRequestFields({ radius: '5000' })).toContain('near');
    });

    it('rejects a non-positive radius', () => {
      expect(badRequestFields({ near: '48.85,2.35', radius: '0' })).toContain(
        'radius',
      );
    });

    it('rejects a non-date timings bound', () => {
      expect(badRequestFields({ timings: { gte: 'soon' } })).toContain(
        'timings.gte',
      );
    });

    it('rejects an unknown range bound', () => {
      expect(badRequestFields({ age: { between: '5' } })).toContain(
        'age.between',
      );
    });

    it('rejects a localTime out of [0,1440]', () => {
      expect(badRequestFields({ localTime: { gte: '5000' } })).toContain(
        'localTime.gte',
      );
    });

    it('rejects an extId missing its value', () => {
      expect(badRequestFields({ extId: { key: 'sys' } })).toContain('extId');
    });

    it('aggregates multiple field errors in one throw', () => {
      expect(
        badRequestFields({ uid: 'x', status: '99', sort: 'nope' }),
      ).toEqual(expect.arrayContaining(['uid', 'status', 'sort']));
    });
  });
});
