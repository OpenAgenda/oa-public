import buildAgendaSearchQuery from '../api-v3/lib/buildAgendaSearchQuery.js';

// Inputs mirror what `qs` (extended) produces: scalars are strings, repeated
// params are arrays.

function badRequestFields(rawQuery) {
  let thrown;
  try {
    buildAgendaSearchQuery(rawQuery);
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

describe('90 - api-v3 unit - buildAgendaSearchQuery', () => {
  describe('valid mappings', () => {
    it('returns an empty query when no filters are given', () => {
      expect(buildAgendaSearchQuery({})).toEqual({});
    });

    it('maps search (scalar)', () => {
      expect(buildAgendaSearchQuery({ search: 'jazz' })).toEqual({
        search: 'jazz',
      });
    });

    it('maps uid to an integer list', () => {
      expect(buildAgendaSearchQuery({ uid: ['12', '13'] })).toEqual({
        uid: [12, 13],
      });
      // A single value still becomes a list.
      expect(buildAgendaSearchQuery({ uid: '12' })).toEqual({ uid: [12] });
    });

    it('maps slug to a string list', () => {
      expect(buildAgendaSearchQuery({ slug: ['a', 'b'] })).toEqual({
        slug: ['a', 'b'],
      });
    });

    it('maps official to a boolean', () => {
      expect(buildAgendaSearchQuery({ official: 'true' })).toEqual({
        official: true,
      });
      expect(buildAgendaSearchQuery({ official: 'false' })).toEqual({
        official: false,
      });
    });

    it('ignores route-owned params (after, limit, detailed)', () => {
      expect(
        buildAgendaSearchQuery({
          after: 'abc',
          limit: '50',
          detailed: 'true',
          search: 'x',
        }),
      ).toEqual({ search: 'x' });
    });
  });

  describe('rejections (400, all fields aggregated)', () => {
    it('rejects a non-integer uid', () => {
      expect(badRequestFields({ uid: ['12', 'nope'] })).toContain('uid');
    });

    it('rejects a non-boolean official', () => {
      expect(badRequestFields({ official: 'maybe' })).toContain('official');
    });

    it('rejects a multi-valued search', () => {
      expect(badRequestFields({ search: ['a', 'b'] })).toContain('search');
    });

    it('aggregates every offending field in one error', () => {
      const fields = badRequestFields({
        uid: ['x'],
        official: 'maybe',
      });
      expect(fields).toEqual(expect.arrayContaining(['uid', 'official']));
    });
  });
});
