import geolib from 'geolib';
import knex from 'knex';
import logger from '@openagenda/logs';
import countries from '@openagenda/countries';
import fromItemToEntry from '@openagenda/utils/fields/fromItemToEntry.js';
import fromEntryToItem from '@openagenda/utils/fields/fromEntryToItem.js';
import fields from './lib/fields.js';
import getSchema from './lib/getSchema.js';

import create from './create.js';
import get from './get.js';
import list from './list.js';
import merge from './merge.js';
import remove from './remove.js';
import update from './update.js';
import transfer from './transfer.js';
import getINSEECode from './utils/getINSEECode.js';
import geoFields from './utils/geoFields.js';
import decorateWithGeocodeData from './lib/decorateWithGeocodeData.js';
import imageVariants from './lib/imageVariants.js';
import detectCandidates from './duplicates/detectCandidates.js';
import detectAllCandidates from './duplicates/detectAllCandidates.js';
import disqualifyCandidate from './duplicates/disqualifyCandidate.js';
import clearCandidates from './duplicates/clearCandidates.js';

import getSet from './sets/get.js';
import listSet from './sets/list.js';
import createSet from './sets/create.js';

import getSettings from './settings/get.js';

const sets = {
  get: getSet,
  create: createSet,
  list: listSet,
};

const settings = {
  get: getSettings,
};

const Service = Object.assign(
  (c = {}) => {
    const config = Object.keys(c).reduce(
      (obj, key) =>
        (obj[key] !== undefined && c[key] !== undefined
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
        duplicates: {
          geoThreshold: 40,
          nameDistanceThreshold: 10,
        },
      },
    );

    if (c.logger) {
      logger.setModuleConfig(c.logger);
    }

    if (!config.Files) {
      throw new Error(
        '@openagenda/files instance is required for handling images',
      );
    }

    const service = {
      config,
      clients: {
        knex:
          c.knex
          || knex({
            client: 'mysql2',
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
        fromItemToEntry: fromItemToEntry.loadWithLinkedFields(fields),
        fromEntryToItem: fromEntryToItem.bind(null, fields),
      },
    };

    service.decorateWithGeocodeData = decorateWithGeocodeData(service);

    service.sets = {
      create: sets.create.bind(null, service),
      get: sets.get.bind(null, service),
      list: sets.list.bind(null, service),
    };

    const setEndpoints = Object.assign((setUid) => {
      const svc = {
        ...service,
        getSettings: settings.get.bySetUid.bind(null, service, setUid),
      };
      const endpoints = {};
      Object.assign(endpoints, {
        list: list.bySetUid.bind(null, svc, setUid),
        get: get.bySetUid.bind(null, { internals: svc, endpoints }, setUid),
        patch: update.bySetUid.bind(
          null,
          { service: svc, isPatch: true },
          setUid,
        ),
      });
      return {
        locations: {
          ...endpoints,
          create: create.bySetUid.bind(null, svc, setUid),
          merge: merge.bySetUid.bind(
            null,
            { internals: svc, endpoints },
            setUid,
          ),
          remove: remove.bySetUid.bind(
            null,
            { internals: svc, endpoints },
            setUid,
          ),
          update: update.bySetUid.bind(
            null,
            { service: svc, isPatch: false },
            setUid,
          ),
          duplicates: {
            detect: detectCandidates.bind(null, { internals: svc, endpoints }),
            detectAll: detectAllCandidates.bind(null, {
              internals: svc,
              endpoints,
            }),
            disqualifyCandidate: disqualifyCandidate.bind(null, endpoints),
            clearCandidates: clearCandidates.bind(null, endpoints),
          },
        },
        settings: {
          get: settings.get.bySetUid.bind(null, svc, setUid),
        },
      };
    }, service.sets);

    const agendaEndpoints = (agendaUid) => {
      const svc = {
        ...service,
        getSettings: settings.get.byAgendaUid.bind(null, service, agendaUid),
      };
      const endpoints = {};
      Object.assign(endpoints, {
        list: list.byAgendaUid.bind(null, svc, agendaUid),
        get: get.byAgendaUid.bind(
          null,
          { internals: svc, endpoints },
          agendaUid,
        ),
        patch: update.byAgendaUid.bind(
          null,
          { service: svc, isPatch: true },
          agendaUid,
        ),
      });

      return {
        ...endpoints,
        create: create.byAgendaUid.bind(null, svc, agendaUid),
        update: update.byAgendaUid.bind(
          null,
          { service: svc, isPatch: false },
          agendaUid,
        ),
        remove: remove.byAgendaUid.bind(
          null,
          { internals: svc, endpoints },
          agendaUid,
        ),
        merge: merge.byAgendaUid.bind(
          null,
          { internals: svc, endpoints },
          agendaUid,
        ),
        transfer: transfer.byAgendaUid.bind(null, svc, agendaUid),
        settings: {
          get: settings.get.byAgendaUid.bind(null, svc, agendaUid),
        },
        duplicates: {
          detect: detectCandidates.bind(null, { internals: svc, endpoints }),
          detectAll: detectAllCandidates.bind(null, {
            internals: svc,
            endpoints,
          }),
          disqualifyCandidate: disqualifyCandidate.bind(null, endpoints),
          clearCandidates: clearCandidates.bind(null, endpoints),
        },
      };
    };

    return Object.assign(agendaEndpoints, {
      get: get.bind(null, { internals: service, endpoints: agendaEndpoints }),
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
      geoFields,
      getSchema,
    },
  },
);

export default Service;
