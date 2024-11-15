import { inflate } from '../utils/aggregatorObjects.js';

export function formatDSL(query, options = {}) {
  return {
    terms: {
      field: 'member._agg',
      size: options.size,
    },
  };
}

export function formatResult({ buckets }) {
  return buckets.map((bucket) => {
    const member = inflate(bucket.key);

    const key = member.uid;
    member.uid = parseInt(member.uid, 10);

    return {
      key,
      member,
      eventCount: bucket.doc_count,
    };
  });
}
