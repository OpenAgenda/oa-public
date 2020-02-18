'use strict';

module.exports = field => ({
  formatDSL: (query, options = {}) => ({
    terms: {
      field: ['location', field].join('.'),
      size: options.size
    }
  }),
  formatResult: result => result.buckets.map(b => ({
    key: b.key,
    eventCount: b.doc_count
  }))
})
