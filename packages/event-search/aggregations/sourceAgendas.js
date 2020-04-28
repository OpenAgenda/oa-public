'use strict';

const _ = require('lodash');
const parseAgendaBucket = require('../utils/parseAgendaBucket');

module.exports.formatDSL = (query, options = {}) => {
  return {
    nested: {
      path: 'sourceAgendas'
    },
    aggregations: {
      sourceAgendas: {
        terms: {
          field: 'sourceAgendas._agg'
        }
      }
    }
  };
}

module.exports.formatResult = result => _.get(result, 'sourceAgendas.buckets', []).map(parseAgendaBucket);
