'use strict';

const validateQuery = require('../utils/validateQuery');
const getDSLQueryPart = require('../utils/getDSLQueryPart');

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
        ],
        minimum_should_match: 1,
        should: [
          {
            bool: {
              must_not: {
                exists: {
                  field: 'removed',
                },
              },
            },
          },
          {
            term: {
              removed: false,
            },
          },
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
        ],
        minimum_should_match: 1,
        should: [
          {
            bool: {
              must_not: {
                exists: {
                  field: 'removed',
                },
              },
            },
          },
          {
            term: {
              removed: false,
            },
          },
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
        ],
        minimum_should_match: 1,
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
        should: [
          {
            bool: {
              must_not: {
                exists: {
                  field: 'removed',
                },
              },
            },
          },
          {
            term: {
              removed: false,
            },
          },
        ],
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
        ],
        minimum_should_match: 1,
        should: [
          {
            bool: {
              must_not: {
                exists: {
                  field: 'removed',
                },
              },
            },
          },
          {
            term: {
              removed: false,
            },
          },
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
        ],
        minimum_should_match: 1,
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
        should: [
          {
            bool: {
              must_not: {
                exists: {
                  field: 'removed',
                },
              },
            },
          },
          {
            term: {
              removed: false,
            },
          },
        ],
      },
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
        ],
        minimum_should_match: 1,
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
        should: [
          {
            bool: {
              must_not: {
                exists: {
                  field: 'removed',
                },
              },
            },
          },
          {
            term: {
              removed: false,
            },
          },
        ],
      },
    });
  });
});
