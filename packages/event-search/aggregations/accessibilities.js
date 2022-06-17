'use strict';

module.exports.formatDSL = function formatDSL(query) {
  return {
    terms: {
      field: '_search_keywords',
      include: 'accessibility.*',
    }
  }
}

module.exports.formatResult = function formatResult(result) {
  return result.buckets.map(b => ({
    key: b.key.split('.').pop(),
    eventCount: b.doc_count
  }));
}