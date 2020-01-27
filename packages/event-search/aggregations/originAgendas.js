'use strict';

module.exports.formatDSL = () => ({
  terms: {
    field: '_search_origin_agenda'
  }
})

module.exports.formatResult = ({ buckets }) => buckets.map(bucket => {
  const agenda = bucket.key.split('|').reduce((agenda, fieldValuePair) => {
    const [field, value] = fieldValuePair.split(':');
    return {
      ...agenda,
      [field]: value
    }
  }, {});

  const key = agenda.uid;
  agenda.uid = parseInt(agenda.uid);

  return {
    key,
    agenda,
    eventCount: bucket.doc_count
  }
});
