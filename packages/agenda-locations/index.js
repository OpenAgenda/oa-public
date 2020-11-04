'use strict';

const knex = require('knex');
const logger = require('@openagenda/logs');
const countries = require('@openagenda/countries');

const create = require('./create');
const geolib = require('geolib');
const get = require('./get');
const list = require('./list');
const merge = require('./merge');
const remove = require('./remove');
const terms = require('./terms');
const update = require('./update');
const getINSEECode = require('./utils/getINSEECode');
const decorateWithGeocodeData = require('./lib/decorateWithGeocodeData');
const imageVariants = require('./lib/imageVariants');

const sets = {
  get: require('./sets/get'),
  create: require('./sets/create')
};

module.exports = Object.assign((c = {}) => {
  const config = Object.keys(c).reduce((config, key) => (
    config[key] !== undefined && c[key] !== undefined ? {
    ...config,
    [key]: c[key]
  } : config), {
    redis: null,
    imagePath: '//cdn.to.images/',
    Files: null,
    schema: 'location',
    setSchema: 'location_set',
    interfaces: {
      getAgendaDetailsByUid: async uid => null,
      getEventCounts: async (identifiers, locationUids = []) => [],
      locationsWillMerge: async (mergeIn, mergedLocations) => {},
      onUpdate: null
    }
  });

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  };

  if (!config.Files) {
    throw new Error('@openagenda/files instance is required for handling images');
  }

  const service = {
    config,
    clients: {
      knex: c.knex || knex({
        client: 'mysql',
        connection: config.mysql
      }),
      redis: c.redis
    },
    interfaces: config.interfaces,
    imageTransformAndUpload: config.Files({
      key: 'image',
      variants: imageVariants(config.Files)
    }),
    getINSEECode: c.redis ? getINSEECode(c.redis) : null
  };

  service.decorateWithGeocodeData = decorateWithGeocodeData(service);

  service.sets = {
    create: sets.create.bind(null, service),
    get: sets.get.bind(null, service)
  };

  const setEndpoints = Object.assign(setUid => ({
    locations: {
      create: create.bySetUid.bind(null, service, setUid),
      get: get.bySetUid.bind(null, service, setUid),
      list: list.bySetUid.bind(null, service, setUid),
      merge: merge.bySetUid.bind(null, service, setUid),
      patch: update.bySetUid.bind(null, { service, isPatch: true }, setUid),
      terms: terms.bySetUid.bind(null, service, setUid),
      remove: remove.bySetUid.bind(null, service, setUid),
      update: update.bySetUid.bind(null, { service, isPatch: false }, setUid)
    }
  }), service.sets);

  const agendaEndpoints = agendaUid => ({
    create: create.byAgendaUid.bind(null, service, agendaUid),
    update: update.byAgendaUid.bind(null, { service, isPatch: false }, agendaUid),
    patch: update.byAgendaUid.bind(null, { service, isPatch: true }, agendaUid),
    remove: remove.byAgendaUid.bind(null, service, agendaUid),
    list: list.byAgendaUid.bind(null, service, agendaUid),
    terms: terms.byAgendaUid.bind(null, service, agendaUid),
    merge: merge.byAgendaUid.bind(null, service, agendaUid),
    get: get.byAgendaUid.bind(null, service, agendaUid)
  });

  return Object.assign(agendaEndpoints, {
    get: get.bind(null, service),
    list: list.bind(null, service),
    utils: {
      getINSEECode: service.getINSEECode,
      countries
    },
    imageTransformAndUpload: service.imageTransformAndUpload,
    agendas: agendaEndpoints,
    sets: setEndpoints
  });

}, {
  utils: {
    countries,
    distance: geolib.getDistance
  }
});
