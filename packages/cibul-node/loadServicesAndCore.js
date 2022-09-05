'use strict';

const config = require('./config');
const initServices = require('./services/init');
const Core = require('./core');

module.exports = async () => {
  const services = await initServices();
  const core = Core(services, config);

  services.core = core;

  return {
    services,
    core,
    config
  };
};
