'use strict';

const Agendas = require('./agendas');
const Networks = require('./networks');
const Users = require('./users');
const Tasks = require('./tasks');

const {
  TYPES: stateChangeTypes
} = require('./agendas/utils/assignState');

module.exports = (services, config) => {
  const core = {
    services,
    tasks: Tasks(services),
    getConfig: () => config
  };

  core.agendas = Agendas(core);
  core.networks = Networks(core);
  core.users = Users(core);

  services.core = core;

  core.constants = {
    stateChangeTypes
  };

  return core;
};
