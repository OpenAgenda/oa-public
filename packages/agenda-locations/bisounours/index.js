'use strict';

const knex = require('knex');
const logger = require('@openagenda/logs');

const list = require('./list');

module.exports = (c = {}) => {
  const config = Object.keys(c).reduce((config, key) => (
    config[key] !== undefined && c[key] !== undefined ? {
    ...config,
    [key]: c[key]
  } : config), {
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
    listByAgendaUid: list.byAgendaUid.bind(null, service)
  });

  service.exposed = Object.assign(agendaUid => ({
    list: service.listByAgendaUid.bind(null, agendaUid)
  }), {});

  return service.exposed;
}
