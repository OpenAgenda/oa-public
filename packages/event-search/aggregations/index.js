'use strict';

const {
  BadRequest,
} = require('@openagenda/verror');

const terms = require('./terms');
const timestamp = require('./timestamp');
const missingAdditionalFields = require('./missingAdditionalFields');

const additionalFields = require('./additionalFields');
const additionalFieldMetrics = require('./additionalFieldMetrics');
const geohash = require('./geohash');
const viewport = require('./viewport');
const eventsByDateRanges = require('./eventsByDateRanges');
const keywords = require('./keywords');
const languages = require('./languages');
const locations = require('./locations');
const members = require('./members');
const timespan = require('./timespan');
const originAgendas = require('./originAgendas');
const relative = require('./relative');
const timings = require('./timings');
const accessibilities = require('./accessibilities');
const sourceAgendas = require('./sourceAgendas');

const aggregationTypes = {
  additionalFields,
  additionalFieldMetrics,
  cities: terms('location.city'),
  districts: terms('location.district'),
  geohash,
  viewport,
  eventsByDateRanges,
  departments: terms('location.department'),
  keywords,
  languages,
  locations,
  members,
  timespan,
  originAgendas,
  relative,
  regions: terms('location.region'),
  adminLevels3: terms('location.adminLevel3'),
  adminLevels5: terms('location.adminLevel5'),
  sourceAgendas,
  states: terms('state', { order: { _key: 'desc' } }),
  status: terms('status', { order: { _key: 'asc' } }),
  addMethods: terms('addMethod'),
  attendanceModes: terms('attendanceMode', { order: { _key: 'desc' } }),
  timings,
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('_exclusiveUpdatedAt'),
  createdOrUpdatedAt: timestamp('updatedAt'),
  accessibilities,
  missingAdditionalFields,
};

function extractKeyAndType(requested) {
  return typeof requested === 'string' ? {
    key: requested,
    type: requested,
    requested,
  } : {
    key: requested.key || requested.type,
    type: requested.type,
    requested,
  };
}

function getRequestedItemErrors(requestedAgg, index = null) {
  const errors = [];

  const { type, key } = extractKeyAndType(requestedAgg);

  if (type === undefined) {
    errors.push({
      index,
      message: 'requested aggregation type is not defined',
    });
  }
  if (key === undefined) {
    errors.push({
      index,
      message: 'requested aggregation key is not defined',
    });
  }

  return errors;
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

function getOptions(requested, options = {}) {
  return {
    ...options,
    ...typeof requested === 'string' ? {} : requested,
  };
}

module.exports = {
  formatDSL: (requested, query, options = {}) => {
    const errors = getValidationErrors(requested);

    if (errors.length) {
      throw new BadRequest({
        info: { errors },
      }, 'Invalid requested aggregations');
    }

    // here it is necessary to build an aggregation specifically for
    // empty values, when they are required (missing config on )

    return [].concat(requested)
      .map(extractKeyAndType)
      .reduce((aggregationDSL, { key, type, requested: r }) => {
        const formatDSL = aggregationTypes[type] && aggregationTypes[type].formatDSL;

        if (typeof formatDSL !== 'function') {
          throw new BadRequest({
            info: { type },
          }, 'Invalid requested aggregations: Unkown aggregation type');
        }

        return {
          ...aggregationDSL,
          [key]: formatDSL(
            query,
            getOptions(r, options),
          ),
        };
      }, missingAdditionalFields.formatDSL(requested, query, options));
  },
  formatResult: (requested, query, result, options = {}) => missingAdditionalFields.dispatchMissingCounts(
    requested,
    result,
    requested
      .map(extractKeyAndType)
      .reduce((formatted, { key, type, requested: r }) => ({
        ...formatted,
        [key]: aggregationTypes[type].formatResult(result[key], { ...getOptions(r, options), query }),
      }), {}),
  ),
};
