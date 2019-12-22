"use strict";

const tasks = require('./tasks');
const initServices = require( '../services/init' );

const services = {};
const config = {};

module.exports = {
  init: async (c, options = {}) => {
    Object.assign(services, await initServices(c, options));
    Object.assign(config, c);
    tasks.loadQueue();
  },
  loadServices: s => s ? Object.assign(services, s) : services,
  getConfig: () => config,
  agendas: require('./agendas').bind(null, services),
  networks: require('./networks')(services),
  users: require('./users')(services),
  tasks
}
