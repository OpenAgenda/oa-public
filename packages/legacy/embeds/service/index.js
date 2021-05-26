'use strict';

const Create = require('./lib/create');
const get = require('./lib/get');
const Update = require('./lib/update');

module.exports = (config = {}) => {
  const internals = {
    knex: config.knex,
    interfaces: {
      getAgendaId: config.interfaces?.getAgendaId
    }
  };

  return agendaUid => ({
    create: Create(internals, agendaUid),
    update: Update(internals, agendaUid),
    get: (...args) => get(internals, agendaUid, ...args)
  });
};
