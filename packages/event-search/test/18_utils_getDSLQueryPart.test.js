import validateQuery from '../utils/validateQuery.js';
import getDSLQueryPart from '../utils/getDSLQueryPart.js';

// Soft-delete exclusion now lives in filter context (cacheable, unscored): a
// plain term appended as the last `filter` clause, instead of a scored
// top-level `should`. The index is normalised (every doc has `removed`), so no
// `exists` fallback is needed.
const removedFilter = {
  term: {
    removed: false,
  },
};

describe('event-search - unit: utils - getDSLQueryPart', () => {
  it('filtering by uid only', () => {
    expect(getDSLQueryPart(validateQuery({ uid: 123 }))).toEqual({
      bool: {
        filter: [
          {
            term: { uid: 123 },
          },
          {
            terms: { state: [2] },
          },
          removedFilter,
        ],
      },
    });
  });

  it('filtering by multiple uids', () => {
    expect(getDSLQueryPart(validateQuery({ uid: [123, 456] }))).toEqual({
      bool: {
        filter: [
          {
            terms: {
              uid: [123, 456],
            },
          },
          {
            terms: {
              state: [2],
            },
          },
          removedFilter,
        ],
      },
    });
  });

  it('filtering by relative', () => {
    expect(
      getDSLQueryPart(validateQuery({ relative: ['passed', 'upcoming'] })),
    ).toEqual({
      bool: {
        filter: [
          {
            terms: {
              state: [2],
            },
          },
          removedFilter,
        ],
        must_not: {
          bool: {
            filter: [
              {
                range: {
                  _search_first_timing: {
                    lte: 'now',
                  },
                },
              },
              {
                range: {
                  _search_last_timing: {
                    gte: 'now',
                  },
                },
              },
            ],
          },
        },
      },
    });
  });

  it('filtering by uniq ReferencingAgendaUid', () => {
    expect(
      getDSLQueryPart(validateQuery({ referencingAgendaUid: 123 })),
    ).toEqual({
      bool: {
        filter: [
          {
            term: {
              _referencing_agenda_uids: 123,
            },
          },
          {
            terms: {
              state: [2],
            },
          },
          removedFilter,
        ],
      },
    });
  });

  it('filtering by uniq notReferencingAgendaUid', () => {
    expect(
      getDSLQueryPart(validateQuery({ notReferencingAgendaUid: 123 })),
    ).toEqual({
      bool: {
        filter: [
          {
            terms: {
              state: [2],
            },
          },
          removedFilter,
        ],
        must_not: {
          bool: {
            filter: [
              {
                term: {
                  _referencing_agenda_uids: 123,
                },
              },
            ],
          },
        },
      },
    });
  });

  it('filtering by origin agenda uid', () => {
    const DSL = getDSLQueryPart(
      validateQuery({
        originAgenda: {
          uid: [123],
        },
      }),
    );

    expect(DSL.bool.filter.find((f) => f.term?.['originAgenda.uid'])).toEqual({
      term: {
        'originAgenda.uid': 123,
      },
    });
  });

  it('filtering by proximity (geoDistance)', () => {
    expect(
      getDSLQueryPart(
        validateQuery({
          geoDistance: { center: { lat: 48.85, lng: 2.35 }, distance: 5000 },
        }),
      ),
    ).toEqual({
      bool: {
        must: [
          {
            geo_distance: {
              distance: '5000m',
              _search_location: { lat: 48.85, lon: 2.35 },
            },
          },
        ],
        filter: [
          {
            terms: { state: [2] },
          },
          removedFilter,
        ],
      },
    });
  });

  it('ignores an incomplete geoDistance (center without distance)', () => {
    const DSL = getDSLQueryPart(
      validateQuery({ geoDistance: { center: { lat: 48.85, lng: 2.35 } } }),
    );

    expect(JSON.stringify(DSL)).not.toContain('geo_distance');
  });

  describe('member structure search (admin-only, GDPR gating)', () => {
    it('does not search member fields for public access', () => {
      const DSL = getDSLQueryPart(validateQuery({ search: 'emmaus' }), {
        access: 'public',
      });
      expect(JSON.stringify(DSL)).not.toContain('_admin_search_member');
    });

    it('does not search member fields when access is undefined', () => {
      const DSL = getDSLQueryPart(validateQuery({ search: 'emmaus' }));
      expect(JSON.stringify(DSL)).not.toContain('_admin_search_member');
    });

    it('does not search member fields for contributor access', () => {
      const DSL = getDSLQueryPart(validateQuery({ search: 'emmaus' }), {
        access: 'contributor',
      });
      expect(JSON.stringify(DSL)).not.toContain('_admin_search_member');
    });

    for (const access of ['moderator', 'administrator', 'internal']) {
      it(`searches member fields for ${access} access`, () => {
        const str = JSON.stringify(
          getDSLQueryPart(validateQuery({ search: 'emmaus' }), { access }),
        );
        expect(str).toContain('_admin_search_member');
        expect(str).toContain('_admin_search_member_filtered');
      });
    }

    it('adds the member field to quoted (phrase) search for admins', () => {
      const DSL = getDSLQueryPart(validateQuery({ search: '"emmaus"' }), {
        access: 'administrator',
      });
      expect(JSON.stringify(DSL)).toContain('_admin_search_member');
    });
  });

  it('filtering by multiple notReferencingAgendaUid', () => {
    expect(
      getDSLQueryPart(validateQuery({ notReferencingAgendaUid: [123, 124] })),
    ).toEqual({
      bool: {
        filter: [
          {
            terms: {
              state: [2],
            },
          },
          removedFilter,
        ],
        must_not: {
          bool: {
            filter: [
              {
                terms: {
                  _referencing_agenda_uids: [123, 124],
                },
              },
            ],
          },
        },
      },
    });
  });
});
