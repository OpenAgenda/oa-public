'use strict';

module.exports = (field, aggOptions = {}) => ({
  formatDSL: (query, options = {}) => ({
    terms: {
      field,
      size: options.size,
      ...aggOptions
    }
  }),
  formatResult: result => result.buckets.map(b => ({
    key: b.key,
    eventCount: b.doc_count
  }))
})
