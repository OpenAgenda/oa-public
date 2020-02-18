'use strict';

const inflate = require('../utils/aggregatorObjects').inflate;

module.exports.formatDSL = () => ({
  terms: {
    field: 'member._agg'
  }
})

module.exports.formatResult = ({ buckets }) => buckets.map(bucket => {
  const member = inflate(bucket.key);

  const key = member.uid;
  member.uid = parseInt(member.uid);

  return {
    key,
    member,
    eventCount: bucket.doc_count
  }
});
