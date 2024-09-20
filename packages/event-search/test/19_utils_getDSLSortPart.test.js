'use strict';

const getDSLSortPart = require('../utils/getDSLSortPart');

describe('event-search - unit: utils - getDSLSortPart', () => {
  it('multiple location sort', () => {
    expect(
      getDSLSortPart({ sort: ['location.region.asc', 'location.city.asc'] }),
    ).toStrictEqual([
      { 'location.region': 'asc' },
      { 'location.city': 'asc' },
      { uid: { order: 'asc' } },
    ]);
  });
  it('multiple location sort with timings', () => {
    expect(
      getDSLSortPart({
        sort: ['location.region.asc', 'location.city.asc', 'timings.asc'],
      }),
    ).toStrictEqual([
      { 'location.region': 'asc' },
      { 'location.city': 'asc' },
      {
        '_sort_timings.begin': {
          mode: 'min',
          nested: {
            filter: {
              range: {
                '_sort_timings.accessible_until': {
                  gte: expect.any(String),
                },
              },
            },
            path: '_sort_timings',
          },
          order: 'asc',
        },
      },
      { _search_last_timing: { order: 'desc' } },
      { uid: { order: 'asc' } },
    ]);
  });
});
