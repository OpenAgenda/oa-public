'use strict';

const validateDate = require('@openagenda/validators/date')({
  default: 'now'
});

module.exports.formatDSL = (query, { includes }) => {
  const {
    lte,
    gte
  } = {
    ..._defaultDateBounds(),
    ...(query || {}).date || {}
  };

  return ({
    nested: {
      path: 'timings'
    },
    aggregations: {
      timings: {
        date_range: {
          field: 'timings.begin',
          format: 'yyyy-MM-dd',
          ranges: _range(gte, lte),
          time_zone: 'Europe/Paris'
        },
        aggregations: {
          timing_to_event: {
            reverse_nested: {},
            aggs: {
              top: {
                top_hits: {
                  size: 3,
                  _source: {
                    excludes: [
                      '_*',
                      'timings._*'
                    ],
                    includes
                  }
                }
              }
            }
          }
        }
      }
    }
  });
}

module.exports.formatResult = ({ timings, doc_count }) => timings.buckets.map(b => ({
  key: b.key.substr(0, 10),
  eventCount: b.doc_count,
  sampleEvents: b.timing_to_event.top.hits.hits.map(h => h._source)
}));

function _range(fromDate, toDate) {
  const items = [];
  const lastItem = _stringifyDate(toDate);
  let cursor = _stringifyDate(fromDate);

  do {
    items.push({
      from: cursor,
      to: (cursor = _iterateCursor(cursor))
    });
  } while (cursor <= lastItem);

  return items;
}

function _defaultDateBounds() {
  const ref = new Date();

  ref.setDate(1);

  const gte = new Date(ref);

  ref.setMonth(ref.getMonth()+1);
  ref.setDate(0);

  return {
    gte,
    lte: ref
  }
}

function _stringifyDate(dirty) {
  const d = validateDate(dirty)

  return [
    d.getFullYear(),
    _fZ(d.getMonth() + 1),
    _fZ(d.getDate())
  ].join('-');
}

function _iterateCursor(c) {
  let cursorDate = new Date(c);
  cursorDate.setDate(cursorDate.getDate()+1);
  return _stringifyDate(cursorDate);
}

function _fZ(str) {
  return (str + '').length === 1 ? ('0' + str) : str;
}
