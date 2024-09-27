'use strict';

const { inflate } = require('./aggregatorObjects');

module.exports = (bucket) => {
  const agenda = inflate(bucket.key);

  const key = agenda.uid;
  agenda.uid = parseInt(agenda.uid, 10);

  return {
    key,
    agenda,
    eventCount: bucket.doc_count,
  };
};
