'use strict';

module.exports.formatDSL = (query, options = {}) => ({
  date_range: {
    field: '_search_last_timing',
    ranges: [{
      key: 'past',
      to: 'now'
    }, {
      key: 'upcoming',
      from: 'now'
    }]
  }
})

module.exports.formatResult = result => result.buckets.map(b => ({
  key: b.key,
  eventCount: b.doc_count
}));
