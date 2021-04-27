'use strict';

const terms = require('./terms');
const timestamp = require('./timestamp');

const aggregationTypes = {
  additionalFields: require('./additionalFields'),
  additionalFieldMetrics: require('./additionalFieldMetrics'),
  cities: terms('location.city'),
  geohash: require('./geohash'),
  eventsByDateRanges: require('./eventsByDateRanges'),
  departments: terms('location.department'),
  keywords: require('./keywords'),
  languages: require('./languages'),
  members: require('./members'),
  timespan: require('./timespan'),
  originAgendas: require('./originAgendas'),
  relative: require('./relative'),
  regions: terms('location.region'),
  sourceAgendas: require('./sourceAgendas'),
  states: terms('state', { order: { _key: 'desc' } }),
  addMethods: terms('addMethod'),
  attendanceModes: terms('attendanceMode', { order: { _key: 'desc' } }),
  timings: require('./timings'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('_exclusiveUpdatedAt'),
  createdOrUpdatedAt: timestamp('updatedAt')
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
      .reduce((aggregationDSL, { key, type, requested }) => {
        const formatDSL = aggregationTypes[type] && aggregationTypes[type].formatDSL;

        if (typeof formatDSL !== 'function') {
          throw new BadRequest('Invalid requested aggregations', [{ message: `Unkown aggregation type: ${type}` }]);
        }

        return {
          ...aggregationDSL,
          [key]: formatDSL(
            query,
            getOptions(requested, options)
          )
        };
      }, {});
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
    ...(typeof requested === 'string' ? {} : requested)
  };
}
