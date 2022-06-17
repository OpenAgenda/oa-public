'use strict';

module.exports.formatDSL = (query, options = {}) => ({
  terms: {
    field: '_search_keywords',
    size: options.size,
    exclude: 'accessibility.*',
  }
});

module.exports.formatResult = result => result.buckets.map(b => ({
  key: b.key,
  eventCount: b.doc_count
}));
