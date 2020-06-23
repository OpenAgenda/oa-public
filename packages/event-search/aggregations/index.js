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
  updatedAt: timestamp('_exclusiveUpdatedAt')
}

class BadRequest extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'BadRequest';
    this.statusCode = 400;
    this.detail = detail;
  }
}

module.exports = {
  formatDSL: (requested, query, options = {}) => {
    const errors = getValidationErrors(requested);

    if (errors.length) {
      throw new BadRequest('Invalid requested aggregations', errors);
    }

    return [].concat(requested)
      .map(extractKeyAndType)
      .reduce((aggregationDSL, { key, type, requested }) => ({
        ...aggregationDSL,
        [key]: aggregationTypes[type].formatDSL(
          query,
          getOptions(requested, options)
        )
      }), {})
  },
  formatResult: (requested, query, result, options = {}) => requested
    .map(extractKeyAndType)
    .reduce((formatted, { key, type, requested }) => ({
      ...formatted,
      [key]: aggregationTypes[type].formatResult(result[key], { ...getOptions(requested, options), query })
    }), {})
}

function getValidationErrors(requested) {
  const errors = [];

  if (requested instanceof Array) {
    requested.forEach((item, index) => {
      getRequestedItemErrors(item, index).forEach(e => errors.push(e));
    });
  } else {
    getRequestedItemErrors(requested).forEach(e => errors.push(e));
  }

  return errors;
}

function getRequestedItemErrors(requestedAgg, index = null) {
  const errors = [];

  const { type, key } = extractKeyAndType(requestedAgg);

  if (type === undefined) {
    errors.push({
      index,
      message: `requested aggregation type is not defined`
    });
  }
  if (key === undefined) {
    errors.push({
      index,
      message: `requested aggregation key is not defined`
    });
  }

  return errors;
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
