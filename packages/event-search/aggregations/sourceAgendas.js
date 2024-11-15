import _ from 'lodash';
import parseAgendaBucket from '../utils/parseAgendaBucket.js';

export function formatDSL(query, options = {}) {
  return {
    nested: {
      path: 'sourceAgendas',
    },
    aggregations: {
      sourceAgendas: {
        terms: {
          field: 'sourceAgendas._agg',
          size: options.size,
        },
      },
    },
  };
}

export function formatResult(result) {
  return _.get(result, 'sourceAgendas.buckets', []).map(parseAgendaBucket);
}
