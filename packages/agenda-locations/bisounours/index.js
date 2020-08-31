'use strict';

const knex = require('knex');
const logger = require('@openagenda/logs');

const create = require('./create');
const get = require('./get');
const list = require('./list');
const merge = require('./merge');
const stream = require('./stream');
const update = require('./update');
const getINSEECode = require('./utils/getINSEECode');
const Images = require('./utils/Images');

module.exports = (c = {}) => {
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
    schema: 'location',
    interfaces: {
      getAgendaIdByUid: async id => null,
      getEventCounts: async (identifiers, locationUids = []) => [],
      locationsWillMerge: async (mergeIn, mergedLocations) => {}
    }
  });

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  };

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
    }
  };

  Object.assign(service, {
    listByAgendaUid: list.byAgendaUid.bind(null, service),
    streamByAgendaUid: stream.byAgendaUid.bind(null, service),
    getByAgendaUid: get.byAgendaUid.bind(null, service)
  });

  service.exposed = Object.assign(agendaUid => ({
    create: create.byAgendaUid.bind(null, service, agendaUid),
    update: update.byAgendaUid.bind(null, { service, isPatch: false }, agendaUid),
    patch: update.byAgendaUid.bind(null, { service, isPatch: true }, agendaUid),
    list: service.listByAgendaUid.bind(null, agendaUid),
    merge: merge.byAgendaUid.bind(null, service, agendaUid),
    stream: service.streamByAgendaUid.bind(null, agendaUid),
    get: service.getByAgendaUid.bind(null, agendaUid)
  }), {
    get: get.bind(null, service),
    utils: {
      getINSEECode: config.redis ? getINSEECode(config.redis) : null,
      images: service.utils.images
    }
  });

  return service.exposed;
}
