'use strict';

const knex = require('knex');
const logger = require('@openagenda/logs');

const get = require('./get');
const list = require('./list');
const stream = require('./stream');
const getINSEECode = require('./utils/getINSEECode');

module.exports = (c = {}) => {
  const config = Object.keys(c).reduce((config, key) => (
    config[key] !== undefined && c[key] !== undefined ? {
    ...config,
    [key]: c[key]
  } : config), {
    redis: null,
    imagePath: '//cdn.to.images/',
    schema: 'location',
    interfaces: {
      getAgendaIdByUid: async id => null,
      getEventCounts: async (identifiers, locationUids = []) => []
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
    interfaces: config.interfaces
  };

  Object.assign(service, {
    listByAgendaUid: list.byAgendaUid.bind(null, service),
    streamByAgendaUid: stream.byAgendaUid.bind(null, service),
    getByAgendaUid: get.byAgendaUid.bind(null, service)
  });

  service.exposed = Object.assign(agendaUid => ({
    list: service.listByAgendaUid.bind(null, agendaUid),
    stream: service.streamByAgendaUid.bind(null, agendaUid),
    get: service.getByAgendaUid.bind(null, agendaUid)
  }), {
    get: get.bind(null, service),
    utils: {
      getINSEECode: config.redis ? getINSEECode(config.redis) : null
    }
  });

  return service.exposed;
}
