'use strict';

const aggregationTypes = {
  timespan: require('./timespan'),
  originAgendas: require('./originAgendas'),
  eventsByDateRanges: require('./eventsByDateRanges'),
  timings: require('./timings'),
  keywords: require('./keywords'),
  additionalFields: require('./additionalFields')
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
