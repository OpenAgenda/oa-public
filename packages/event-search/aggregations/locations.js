import { inflate } from '../utils/aggregatorObjects.js';

export function formatDSL(query, options = {}) {
  return {
    terms: {
      field: 'location._agg',
      size: options.size,
    },
  };
}

export function formatResult({ buckets }) {
  return buckets.map((bucket) => {
    const location = inflate(bucket.key);

    const key = location.uid;
    location.uid = parseInt(location.uid, 10);

    return {
      key,
      location,
      eventCount: bucket.doc_count,
    };
  });
}
