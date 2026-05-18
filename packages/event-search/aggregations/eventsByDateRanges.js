import dateValidator from '@openagenda/validators/date';

const validateDate = dateValidator({
  default: 'now',
});

function fZ(str) {
  return `${str}`.length === 1 ? `0${str}` : str;
}

function stringifyDate(dirty) {
  const d = validateDate(dirty);

  return [d.getFullYear(), fZ(d.getMonth() + 1), fZ(d.getDate())].join('-');
}

function iterateCursor(c) {
  const cursorDate = new Date(c);
  cursorDate.setDate(cursorDate.getDate() + 1);
  return stringifyDate(cursorDate);
}

function defaultDateBounds() {
  const ref = new Date();

  ref.setDate(1);

  const gte = new Date(ref);

  ref.setMonth(ref.getMonth() + 1);
  ref.setDate(0);

  return {
    gte,
    lte: ref,
  };
}

function range(fromDate, toDate) {
  const items = [];
  const lastItem = stringifyDate(toDate);
  let cursor = stringifyDate(fromDate);

  do {
    items.push({
      from: cursor,
      to: cursor = iterateCursor(cursor),
    });
  } while (cursor <= lastItem);

  return items;
}

export function formatDSL(query, { includes }) {
  const { lte, gte } = {
    ...defaultDateBounds(),
    ...(query || {}).date || {},
  };

  return {
    nested: {
      path: 'timings',
    },
    aggregations: {
      timings: {
        date_range: {
          field: 'timings.begin',
          format: 'yyyy-MM-dd',
          ranges: range(gte, lte),
          time_zone: 'Europe/Paris',
        },
        aggregations: {
          timing_to_event: {
            reverse_nested: {},
            aggs: {
              top: {
                top_hits: {
                  size: 3,
                  _source: {
                    excludes: ['_*', 'timings._*'],
                    includes,
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

export function formatResult({ timings }) {
  return timings.buckets.map((b) => ({
    key: b.key.substr(0, 10),
    eventCount: b.doc_count,
    sampleEvents: b.timing_to_event.top.hits.hits.map((h) => h._source),
  }));
}
