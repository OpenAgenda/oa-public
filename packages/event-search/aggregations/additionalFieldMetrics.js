'use strict';

const _ = require('lodash');

const cleanRequestedMetrics = metrics => metrics && [].concat(metrics).length ? [].concat(metrics).filter(m => [
  'sum', 'avg', 'max', 'min'
].includes(m)) : ['avg'];

module.exports.formatDSL = (query, options = {}) => {
  const {
    field: fieldName,
    formSchema,
    metrics
  } = options;

  const fieldType = formSchema ? formSchema.fields.filter(f => f.field === fieldName).pop().fieldType : 'number';

  return {
    nested: {
      path: '_search_additional_numbers'
    },
    aggs: {
      inner: {
        filter: {
          term: {
            '_search_additional_numbers.fieldName': fieldName
          }
        },
        aggs: cleanRequestedMetrics(metrics).reduce((aggs, metric) => ({
          ...aggs,
          [`${fieldName}_${metric}`]: {
            [metric]: {
              field: `_search_additional_numbers.${fieldType}`
            }
          }
        }), {})
      }
    }
  };
}

module.exports.formatResult = (result, options = {}) => {
  const {
    field: fieldName,
    metrics: requestedMetrics
  } = options;

  return cleanRequestedMetrics(requestedMetrics).reduce((metrics, metric) => ({
    ...metrics,
    [metric]: result.inner[`${fieldName}_${metric}`].value
  }), {});
}
