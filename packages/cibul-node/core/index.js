"use strict";

const tasks = require('./tasks');
const Agendas = require('./agendas');
const Networks = require('./networks');
const Users = require('./users');
const Tasks = require('./tasks');

module.exports = (services, config) => {
  const core = {
    services,
    tasks: Tasks(services),
    getConfig: () => config
  };

  core.agendas = Agendas(core);
  core.networks = Networks(core);
  core.users = Users(services);

  services.core = core;

  return core;
}
