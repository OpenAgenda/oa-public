import { BadRequest } from '@openagenda/verror';
import terms from './terms.js';
import timestamp from './timestamp.js';
import * as missingAdditionalFields from './missingAdditionalFields.js';
import * as additionalFields from './additionalFields.js';
import * as additionalFieldMetrics from './additionalFieldMetrics.js';
import * as geohash from './geohash.js';
import * as viewport from './viewport.js';
import * as eventsByDateRanges from './eventsByDateRanges.js';
import * as keywords from './keywords.js';
import * as languages from './languages.js';
import * as locations from './locations.js';
import * as members from './members.js';
import * as timespan from './timespan.js';
import * as originAgendas from './originAgendas.js';
import * as relative from './relative.js';
import * as timings from './timings.js';
import * as accessibilities from './accessibilities.js';
import * as sourceAgendas from './sourceAgendas.js';

const aggregationTypes = {
  additionalFields,
  additionalFieldMetrics,
  countryCodes: terms('location.countryCode'),
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
  return typeof requested === 'string'
    ? {
      key: requested,
      type: requested,
      requested,
    }
    : {
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

  if (Array.isArray(requested)) {
    requested.forEach((item, index) => {
      getRequestedItemErrors(item, index).forEach((e) => errors.push(e));
    });
  } else {
    getRequestedItemErrors(requested).forEach((e) => errors.push(e));
  }

  return errors;
}

function getOptions(requested, options = {}) {
  return {
    ...options,
    ...typeof requested === 'string' ? {} : requested,
  };
}

export default {
  formatDSL: (requested, query, options = {}) => {
    const errors = getValidationErrors(requested);

    if (errors.length) {
      throw new BadRequest(
        {
          info: { errors },
        },
        'Invalid requested aggregations',
      );
    }

    // here it is necessary to build an aggregation specifically for
    // empty values, when they are required (missing config on )

    return []
      .concat(requested)
      .map(extractKeyAndType)
      .reduce(
        (aggregationDSL, { key, type, requested: r }) => {
          const formatDSL = aggregationTypes[type] && aggregationTypes[type].formatDSL;

          if (typeof formatDSL !== 'function') {
            throw new BadRequest(
              {
                info: { type },
              },
              'Invalid requested aggregations: Unknown aggregation type',
            );
          }

          return {
            ...aggregationDSL,
            [key]: formatDSL(query, getOptions(r, options)),
          };
        },
        missingAdditionalFields.formatDSL(requested, query, options),
      );
  },
  formatResult: (requested, query, result, options = {}) =>
    missingAdditionalFields.dispatchMissingCounts(
      requested,
      result,
      requested.map(extractKeyAndType).reduce(
        (formatted, { key, type, requested: r }) => ({
          ...formatted,
          [key]: aggregationTypes[type].formatResult(result[key], {
            ...getOptions(r, options),
            query,
          }),
        }),
        {},
      ),
    ),
};
