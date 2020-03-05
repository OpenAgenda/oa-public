'use strict';

module.exports.formatDSL = (query, options = {}) => ({
  terms: {
    field: 'state',
    size: options.size
  }
});

module.exports.formatResult = result => result.buckets.map(b => ({
  key: b.key,
  eventCount: b.doc_count
}));
