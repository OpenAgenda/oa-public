export default {
  formatDSL: (query, options = {}) => {
    const baseAgg = {
      terms: {
        field: 'valid',
        size: options.size || 10,
      },
    };

    return baseAgg;
  },
  formatResult: (result, options = {}) => {
    const buckets = [];

    // Check if we have a separate missing aggregation result
    if (options.missingCount !== undefined && options.missing !== undefined) {
      if (options.missingCount > 0) {
        buckets.push({
          key: options.missing,
          eventCount: options.missingCount,
        });
      }
    }

    // Add the actual boolean values
    result.buckets.forEach((b) => {
      buckets.push({
        key: b.key === 1 ? 'true' : 'false',
        eventCount: b.doc_count,
      });
    });

    return buckets;
  },
};
