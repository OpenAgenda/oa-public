'use strict';

const inflate = require('../utils/aggregatorObjects').inflate;

module.exports.formatDSL = (query, options = {}) => ({
  terms: {
    field: 'location._agg',
    size: options.size
  }
})

module.exports.formatResult = ({ buckets }) => buckets.map(bucket => {
  const location = inflate(bucket.key);

  const key = location.uid;
  location.uid = parseInt(location.uid);

  return {
    key,
    location,
    eventCount: bucket.doc_count
  }
});
