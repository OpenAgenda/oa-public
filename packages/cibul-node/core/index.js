"use strict";

const tasks = require('./tasks');
const initServices = require( '../services/init' );

const services = {};

module.exports = {
  init: async (config, options = {}) => {
    Object.assign(services, await initServices(config, options));
    tasks.loadQueue();
  },
  loadServices: s => Object.assign(services, s),
  agendas: require('./agendas').bind(null, services),
  networks: require('./networks'),
  tasks
}
