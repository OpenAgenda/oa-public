import parseAgendaBucket from '../utils/parseAgendaBucket.js';

export function formatDSL(field, options = {}) {
  return {
    terms: {
      field: 'originAgenda._agg',
      size: options.size,
    },
  };
}

export function formatResult({ buckets }) {
  return buckets.map(parseAgendaBucket);
}
