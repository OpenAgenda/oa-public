import toSortTimingFormat from './toSortTimingFormat.js';

function getMinSortTimings(query) {
  const timings = query?.timings;

  if (!timings) {
    return new Date();
  }

  if (timings.gte) {
    return timings.gte;
  }

  if (Array.isArray(timings)) {
    const dates = timings
      .map((t) => t.gte)
      .filter(Boolean)
      .map((str) => new Date(str));

    if (dates.length === 0) {
      return new Date();
    }

    const minDate = Math.max(
      new Date(Math.min(...dates.map((d) => d.getTime()))),
      new Date(),
    );

    return minDate;
  }

  return new Date();
}

const timings = (query, options = {}) => {
  const { mode = 'min' } = options;

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
                gte: toSortTimingFormat(getMinSortTimings(query)),
              },
            },
          },
        },
      },
    },
    {
      _search_last_timing: { order: 'desc' },
    },
  ];
};

export default function getDSLSortPart(query = {}) {
  const { sort: s = [] } = query;

  const sorts = [].concat(s);

  if (!sorts.length) {
    sorts.push('timings.asc');
  }

  return sorts
    .reduce((acc, sort) => {
      if (sort === 'score') {
        return acc.concat(['_score']);
      }

      const split = sort.split('.');
      const order = split.pop();
      const field = split.join('.');

      if (field === 'timings' || field === 'lastTiming') {
        return acc.concat(
          timings(query, { mode: field === 'lastTiming' ? 'max' : 'min' }),
        );
      }

      if (
        field === 'timingsWithFeatured'
        || field === 'lastTimingWithFeatured'
      ) {
        return acc.concat([{ featured: { order: 'desc' } }]).concat(
          timings(query, {
            mode: field === 'lastTimingWithFeatured' ? 'max' : 'min',
          }),
        );
      }

      return acc.concat({
        [field]: order,
      });
    }, [])
    .concat({ uid: { order: 'asc' } });
}
