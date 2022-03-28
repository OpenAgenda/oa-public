'use strict';

const getFormSchemaAdditionalFields = require('../utils/getFormSchemaAdditionalFields');
const terms = require('./terms');

module.exports.formatDSL = function formatDSL(requested, query, options) {
  const requestedFields = requested
    .filter(r => r.missing)
    .map(r => r.field);

  const fields = getFormSchemaAdditionalFields(options.formSchema)
    .filter(field => !!field.options || field.fieldType === 'boolean')
    .filter(field => requestedFields.includes(field.field));

  if (!fields.length) {
    return {};
  }

  return {
    missingAdditionalFields: {
      terms: {
        field: '_search_empty_fields',
        include: fields.map(f => f.field),
        size: fields.length
      }
    }
  };
};

module.exports.dispatchMissingCounts = function dispatchMissingCounts(requested, rawResult, aggregationResults) {
  if (!rawResult.missingAdditionalFields) {
    return aggregationResults;
  }

  return rawResult.missingAdditionalFields.buckets.reduce((result, bucket) => {
    const matchingRequested = requested.find(r => r.field === bucket.key);

    return {
      ...result,
      [matchingRequested.key]: [{
        key: matchingRequested.missing,
        eventCount: bucket.doc_count
      }].concat(result[matchingRequested.key])
    };
  }, aggregationResults);
}
