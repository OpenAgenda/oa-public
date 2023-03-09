'use strict';

const toSortTimingFormat = require('./toSortTimingFormat');

const timings = (query, options = {}) => {
  const {
    mode = 'min',
  } = options;

  return [
    {
      '_sort_timings.begin': {
        mode,
        order: 'asc',
        nested: {
          path: '_sort_timings',
          filter: {
            range: {
              '_sort_timings.accessible_until': {
                gte: toSortTimingFormat(query?.timings?.gte ?? new Date()),
              },
            },
          },
        },
      },
    }, {
      _search_last_timing: { order: 'desc' },
    }, {
      uid: { order: 'asc' }, // tie breaker
    }];
};

module.exports = function getDSLSortPart(query = {}) {
  const {
    sort: s = [],
  } = query;

  const sorts = [].concat(s);

  if (!sorts.length) {
    sorts.push('timings.asc');
  }

  if (sorts[0] === 'score') {
    return [
      '_score',
      { uid: { order: 'asc' } },
    ];
  }

  const firstSortType = sorts[0].split('.')[0];

  if (firstSortType === 'timingsWithFeatured') {
    return [{
      featured: { order: 'desc' },
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

  if (firstSortType === 'timings') {
    return timings(query);
  }

  if (firstSortType === 'lastTiming') {
    return timings(query, { mode: 'max' });
  }

  return sorts.map(sort => {
    const split = sort.split('.');
    const order = split.pop();
    const field = split.join('.');

    return {
      [field]: order,
    };
  }).concat({
    uid: { order: 'asc' }, // tie breaker
  });
};
