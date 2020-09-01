'use strict';

const knex = require('knex');
const logger = require('@openagenda/logs');

const create = require('./create');
const get = require('./get');
const list = require('./list');
const merge = require('./merge');
const remove = require('./remove');
const stream = require('./stream');
const terms = require('./terms');
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

  return Object.assign(agendaUid => ({
    create: create.byAgendaUid.bind(null, service, agendaUid),
    update: update.byAgendaUid.bind(null, { service, isPatch: false }, agendaUid),
    patch: update.byAgendaUid.bind(null, { service, isPatch: true }, agendaUid),
    remove: remove.byAgendaUid.bind(null, service, agendaUid),
    list: list.byAgendaUid.bind(null, service, agendaUid),
    terms: terms.byAgendaUid.bind(null, service, agendaUid),
    merge: merge.byAgendaUid.bind(null, service, agendaUid),
    stream: stream.byAgendaUid.bind(null, service, agendaUid),
    get: get.byAgendaUid.bind(null, service, agendaUid)
  }), {
    get: get.bind(null, service),
    utils: {
      getINSEECode: config.redis ? getINSEECode(config.redis) : null,
      images: service.utils.images
    }
  });

}
