'use strict';

const geo = require('./geo');
const timestamp = require('./timestamp');

const aggregationTypes = {
  additionalFields: require('./additionalFields'),
  cities: geo('city'),
  eventsByDateRanges: require('./eventsByDateRanges'),
  departments: geo('department'),
  keywords: require('./keywords'),
  members: require('./members'),
  timespan: require('./timespan'),
  originAgendas: require('./originAgendas'),
  pastAndUpcoming: require('./pastAndUpcoming'),
  regions: geo('region'),
  sourceAgendas: require('./sourceAgendas'),
  states: require('./states'),
  timings: require('./timings'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt')
}

module.exports = {
  formatDSL: (requested, query, options = {}) => []
    .concat(requested)
    .map(extractKeyAndType)
    .reduce((aggregationDSL, { key, type, requested }) => ({
      ...aggregationDSL,
      [key]: aggregationTypes[type].formatDSL(
        query,
        getOptions(requested, options)
      )
    }), {}),
  formatResult: (requested, query, result, options = {}) => requested
    .map(extractKeyAndType)
    .reduce((formatted, { key, type, requested }) => ({
      ...formatted,
      [key]: aggregationTypes[type].formatResult(result[key], { ...getOptions(requested, options), query })
    }), {})
}

function extractKeyAndType(requested) {
  return typeof requested === 'string' ? {
    key: requested,
    type: requested,
    requested
  } : {
    key: requested.key || requested.type,
    type: requested.type,
    requested
  }
}

function getOptions(requested, options = {}) {
  return {
    ...options,
    ...(requested === 'string' ? {} : requested)
  };
}
