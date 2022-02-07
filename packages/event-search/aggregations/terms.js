'use strict';

module.exports = (field, aggOptions = {}) => ({
  formatDSL: (query, options = {}) => {
    return ({
    terms: {
      field,
      size: options.size,
      missing: options.missing,
      ...aggOptions
    }
  })},
  formatResult: result => result.buckets.map(b => ({
    key: b.key,
    eventCount: b.doc_count
  }))
})
