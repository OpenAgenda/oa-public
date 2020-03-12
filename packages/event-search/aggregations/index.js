'use strict';

const geo = require('./geo');

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
  timings: require('./timings')
}

module.exports = {
  formatDSL: (requested, query, options = {}) => []
    .concat(requested)
    .reduce((aggregationDSL, requested) => ({
      ...aggregationDSL,
      [getType(requested)]: aggregationTypes[getType(requested)].formatDSL(
        query,
        getOptions(requested, options)
      )
    }), {}),
  formatResult: (result, options) => Object.keys(result).reduce((formatted, requested) => {
    const type = getType(requested);

    return {
      ...formatted,
      [type]: aggregationTypes[type].formatResult(result[type], options)
    };
  }, {})
}

function getType(requested) {
  return typeof requested === 'string' ? requested : requested.type;
}

function getOptions(requested, options = {}) {
  return {
    ...options,
    ...(requested === 'string' ? {} : requested)
  };
}
