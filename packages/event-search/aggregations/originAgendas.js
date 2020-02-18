'use strict';

const inflate = require('../utils/aggregatorObjects').inflate;

module.exports.formatDSL = () => ({
  terms: {
    field: 'originAgenda._agg'
  }
})

module.exports.formatResult = ({ buckets }) => buckets.map(bucket => {
  const agenda = inflate(bucket.key);

  const key = agenda.uid;
  agenda.uid = parseInt(agenda.uid);

  return {
    key,
    agenda,
    eventCount: bucket.doc_count
  }
});
