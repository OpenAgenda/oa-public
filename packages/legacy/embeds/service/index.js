'use strict';

const logger = require('@openagenda/logs');

const Create = require('./lib/create');
const get = require('./lib/get');
const list = require('./lib/list');
const Update = require('./lib/update');

module.exports = (config = {}) => {
  const internals = {
    knex: config.knex,
    interfaces: {
      getAgendaId: config.interfaces?.getAgendaId
    },
    defaultTemplates: config.defaultTemplates
  };

  return agendaUid => ({
    create: Create(internals, agendaUid),
    update: Update(internals, agendaUid),
    list: (...args) => list(internals, agendaUid, ...args),
    get: (...args) => get(internals, agendaUid, ...args)
  });
};

module.exports.updateLoggerConfig = config => {
  logger.setModuleConfig(config);
};
