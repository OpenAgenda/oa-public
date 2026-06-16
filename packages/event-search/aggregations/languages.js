export function formatDSL(query, options = {}) {
  return {
    terms: {
      field: '_search_languages',
      size: options.size,
      missing: options.missing,
    },
  };
}

export function formatResult(result) {
  return result.buckets.map((b) => ({
    key: b.key,
    eventCount: b.doc_count,
  }));
}
