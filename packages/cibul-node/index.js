'use strict';

const config = require('./config');
const initServices = require('./services/init');
const Core = require('./core');

async function loadServicesAndCore() {
  const services = await initServices();
  const core = Core(services, config);

  services.core = core;

  return {
    services,
    core
  };
}

module.exports = {
  loadServicesAndCore,
  config
};
