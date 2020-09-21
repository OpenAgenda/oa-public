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
const Images = require('./utils/Images');

module.exports = Object.assign((c = {}) => {
  const config = Object.keys(c).reduce((config, key) => (
    config[key] !== undefined && c[key] !== undefined ? {
    ...config,
    [key]: c[key]
  } : config), {
    imageTransforms: [{
      name: '{{name}}',
      width: 600
    }, {
      name: '{{name}}_o'
    }, {
      name: '{{name}}_sm',
      width: 300
    }],
    temporaryDirectory: '/tmp/',
    aws: { key: null, secret: null, bucket: null },
    redis: null,
    imagePath: '//cdn.to.images/',
    Files: null,
    schema: 'location',
    interfaces: {
      getAgendaIdByUid: async id => null,
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
      })
    },
    interfaces: config.interfaces,
    utils: {
      images: Images({
        transforms: config.imageTransforms,
        temporaryDirectory: config.temporaryDirectory,
        aws: config.aws
      })
    },
    imageTransformAndUpload: config.Files({
      key: 'image',
      variants: [{
        getFilename: (info, context) => `location${context.uid}_sm.jpg`,
        transform: info => info.stream
      }, {
        getFilename: (info, context) => `location${context.uid}_o.jpg`,
        transform: info => info.stream
      }, {
        getFilename: (info, context) => `location${context.uid}.jpg`,
        transform: info => info.stream
      }]
    })
  };

  return Object.assign(agendaUid => ({
    create: create.byAgendaUid.bind(null, service, agendaUid),
    update: update.byAgendaUid.bind(null, { service, isPatch: false }, agendaUid),
    patch: update.byAgendaUid.bind(null, { service, isPatch: true }, agendaUid),
    remove: remove.byAgendaUid.bind(null, service, agendaUid),
    list: list.byAgendaUid.bind(null, service, agendaUid),
    terms: terms.byAgendaUid.bind(null, service, agendaUid),
    merge: merge.byAgendaUid.bind(null, service, agendaUid),
    get: get.byAgendaUid.bind(null, service, agendaUid)
  }), {
    get: get.bind(null, service),
    list: list.bind(null, service),
    utils: {
      getINSEECode: config.redis ? getINSEECode(config.redis) : null,
      images: service.utils.images,
      countries
    }
  });

}, {
  utils: {
    countries,
    distance: geolib.getDistance
  }
});
