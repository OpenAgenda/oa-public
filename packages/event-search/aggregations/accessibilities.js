export function formatDSL() {
  return {
    terms: {
      field: '_search_keywords',
      include: 'accessibility.*',
    },
  };
}

export function formatResult(result) {
  return result.buckets.map((b) => ({
    key: b.key.split('.').pop(),
    eventCount: b.doc_count,
  }));
}
