'use strict';

const geolib = require('geolib');
const knex = require('knex');
const logger = require('@openagenda/logs');
const countries = require('@openagenda/countries');
const fromItemToEntry = require('@openagenda/utils/fields/fromItemToEntry');
const fromEntryToItem = require('@openagenda/utils/fields/fromEntryToItem');
const fields = require('./lib/fields');

const create = require('./create');
const get = require('./get');
const list = require('./list');
const merge = require('./merge');
const remove = require('./remove');
const terms = require('./terms');
const update = require('./update');
const getINSEECode = require('./utils/getINSEECode');
const decorateWithGeocodeData = require('./lib/decorateWithGeocodeData');
const imageVariants = require('./lib/imageVariants');
const duplicates = require('./duplicates/detectDuplicatesCandidates');
const allDuplicates = require('./duplicates/detectAllDuplicatesCandidates');
const disqualifyCandidate = require('./duplicates/disqualifyCandidate');
const clearCandidates = require('./duplicates/clearCandidates');

const getSet = require('./sets/get');
const createSet = require('./sets/create');

const getSettings = require('./settings/get');

const sets = {
  get: getSet,
  create: createSet,
};

const settings = {
  get: getSettings,
};

module.exports = Object.assign(
  (c = {}) => {
    const config = Object.keys(c).reduce(
      (obj, key) => (obj[key] !== undefined && c[key] !== undefined
        ? {
          ...obj,
          [key]: c[key],
        }
        : obj),
      {
        redis: null,
        imagePath: '//cdn.to.images/',
        Files: null,
        schema: 'location',
        setSchema: 'location_set',
        interfaces: {
          getAgendaDetailsByUid: async () => null, // takes uid, returns an obj with a locationSetUid key
          getEventCounts: async () => [], // takes identifiers, locationUids
          beforeMerge: async () => {}, // takes mergeIn, mergedLocations
          beforeRemove: async () => {}, // takes location
          getAgendaLocationSettings: async () => {},
          getLinkedAgendas: async () => {}, // takes uid, returns linked agendas
          onUpdate: null,
        },
        duplicates
      }
    );

    if (c.logger) {
      logger.setModuleConfig(c.logger);
    }

    if (!config.Files) {
      throw new Error(
        '@openagenda/files instance is required for handling images'
      );
    }

    const service = {
      config,
      clients: {
        knex:
          c.knex
          || knex({
            client: 'mysql',
            connection: config.mysql,
          }),
        redis: c.redis,
      },
      interfaces: config.interfaces,
      imageTransformAndUpload: config.Files({
        key: 'image',
        variants: imageVariants(config.Files),
      }),
      getINSEECode: c.redis ? getINSEECode(c.redis) : null,
      fieldUtils: {
        fromItemToEntry: fromItemToEntry.bind(null, fields),
        fromEntryToItem: fromEntryToItem.bind(null, fields)
      }
    };

    service.decorateWithGeocodeData = decorateWithGeocodeData(service);

    service.sets = {
      create: sets.create.bind(null, service),
      get: sets.get.bind(null, service),
    };

    const setEndpoints = Object.assign(setUid => {
      const svc = { ...service, getSettings: settings.get.bySetUid.bind(null, service, setUid) };
      const endpoints = {
        list: list.bySetUid.bind(null, svc, setUid),
        get: get.bySetUid.bind(null, svc, setUid),
        patch: update.bySetUid.bind(null, { service: svc, isPatch: true }, setUid),
      };
      return {
        locations: {
          ...endpoints,
          create: create.bySetUid.bind(null, svc, setUid),
          merge: merge.bySetUid.bind(null, svc, setUid),
          terms: terms.bySetUid.bind(null, svc, setUid),
          remove: remove.bySetUid.bind(null, svc, setUid),
          update: update.bySetUid.bind(
            null,
            { service: svc, isPatch: false },
            setUid
          ),
          duplicates: {
            detect: duplicates.bind(null, { internals: svc, endpoints }),
            detectAll: allDuplicates.bind(null, { internals: svc, endpoints }),
            disqualifyCandidate: disqualifyCandidate.bind(null, endpoints),
            clearCandidates: clearCandidates.bind(null, endpoints),
          }
        },
        settings: {
          get: settings.get.bySetUid.bind(null, svc, setUid),
        }
      };
    }, service.sets);

    const agendaEndpoints = agendaUid => {
      const svc = { ...service, getSettings: settings.get.byAgendaUid.bind(null, service, agendaUid) };
      const endpoints = {
        list: list.byAgendaUid.bind(null, svc, agendaUid),
        get: get.byAgendaUid.bind(null, svc, agendaUid),
        patch: update.byAgendaUid.bind(
          null,
          { service: svc, isPatch: true },
          agendaUid
        ),
      };

      return {
        ...endpoints,
        create: create.byAgendaUid.bind(null, svc, agendaUid),
        update: update.byAgendaUid.bind(
          null,
          { service: svc, isPatch: false },
          agendaUid
        ),
        remove: remove.byAgendaUid.bind(null, svc, agendaUid),
        list: list.byAgendaUid.bind(null, svc, agendaUid),
        terms: terms.byAgendaUid.bind(null, svc, agendaUid),
        merge: merge.byAgendaUid.bind(null, svc, agendaUid),
        get: get.byAgendaUid.bind(null, svc, agendaUid),
        settings: {
          get: settings.get.byAgendaUid.bind(null, svc, agendaUid),
        },
        duplicates: {
          detect: duplicates.bind(null, { internals: svc, endpoints }),
          detectAll: allDuplicates.bind(null, { internals: svc, endpoints }),
          disqualifyCandidate: disqualifyCandidate.bind(null, endpoints),
          clearCandidates: clearCandidates.bind(null, endpoints),
        }
      };
    };

    return Object.assign(agendaEndpoints, {
      get: get.bind(null, service),
      list: list.bind(null, service),
      utils: {
        getINSEECode: service.getINSEECode,
        countries,
      },
      imageTransformAndUpload: service.imageTransformAndUpload,
      agendas: agendaEndpoints,
      sets: setEndpoints,
    });
  },
  {
    utils: {
      countries,
      distance: geolib.getDistance,
    },
  }
);
