'use strict';

const { inflate } = require('../utils/aggregatorObjects');

module.exports.formatDSL = (query, options = {}) => ({
  terms: {
    field: 'member._agg',
    size: options.size,
  },
});

module.exports.formatResult = ({ buckets }) => buckets.map(bucket => {
  const member = inflate(bucket.key);

  const key = member.uid;
  member.uid = parseInt(member.uid, 10);

  return {
    key,
    member,
    eventCount: bucket.doc_count,
  };
});
