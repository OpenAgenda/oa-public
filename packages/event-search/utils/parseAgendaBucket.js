'use strict';

const inflate = require('./aggregatorObjects').inflate;

module.exports = bucket => {
  const agenda = inflate(bucket.key);

  const key = agenda.uid;
  agenda.uid = parseInt(agenda.uid);

  return {
    key,
    agenda,
    eventCount: bucket.doc_count
  }
}
