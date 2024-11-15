export function formatDSL(query, options = {}) {
  return {
    terms: {
      field: '_search_keywords',
      size: options.size,
      exclude: 'accessibility.*',
    },
  };
}

export function formatResult(result) {
  return result.buckets.map((b) => ({
    key: b.key,
    eventCount: b.doc_count,
  }));
}
