'use strict';

const _ = require('lodash');

const timings = (query, options = {}) => {
  const {
    mode = 'min',
    endOfTimes = '3000-01-01T01:00:00.000Z',
  } = options;

  return [
    {
      '_search_timings.begin' : {
        mode,
        order: 'asc',
        nested: {
          path: '_search_timings',
          filter: {
            range: {
              '_search_timings.accessible_until' : {
                gte: query?.timings?.gte ?? 'now',
                ... mode === 'max' ? { lt: endOfTimes } : null
              }
            }
          }
        }
      }
    }, {
    _search_last_timing: { order: 'desc' }
    }, {
    uid: { order: 'asc' } // tie breaker
  }]
}

module.exports = (query = {}) => {
  const {
    sort: s = []
  } = query;

  const sorts = [].concat(s);

  if (!sorts.length) {
    sorts.push('timings.asc');
  }

  if (sorts[0] === 'score') {
    return [
      '_score',
      { uid: { order: 'asc' } }
    ];
  }

  const firstSortType = sorts[0].split('.')[0];

  if (firstSortType === 'timingsWithFeatured') {
    return [{
      featured: { order: 'desc' }
    }].concat(timings(query));
  }

  if (firstSortType === 'lastTimingWithFeatured') {
    return [
      {
        featured: { order: 'desc' },
      },
      ...timings(query, { mode: 'max' }),
    ];
  }

  if (sorts[0].split('.')[0] === 'timings') {
    return timings(query);
  }

  return sorts.map(sort => {
    const split = sort.split('.');
    const order = split.pop();
    const field = split.join('.');

    return {
      [field]: order
    };
  }).concat({
    uid: { order: 'asc' } // tie breaker
  });
}
