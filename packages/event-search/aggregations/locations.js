'use strict';

const { inflate } = require('../utils/aggregatorObjects');

module.exports.formatDSL = (query, options = {}) => ({
  terms: {
    field: 'location._agg',
    size: options.size,
  },
});

module.exports.formatResult = ({ buckets }) => buckets.map(bucket => {
  const location = inflate(bucket.key);

  const key = location.uid;
  location.uid = parseInt(location.uid, 10);

  return {
    key,
    location,
    eventCount: bucket.doc_count,
  };
});
