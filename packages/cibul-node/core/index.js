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
  agendas: require('./agendas')(services),
  networks: require('./networks')(services),
  users: require('./users')(services),
  getConfig: () => config,
  tasks
}
