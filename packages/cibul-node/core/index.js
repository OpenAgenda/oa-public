"use strict";

const tasks = require('./tasks');
const initServices = require( '../services/init' );

module.exports = {
  init: async (config, options = {}) => {
    await initServices(config, options);
    tasks.loadQueue();
  },
  agendas: require( './agendas' ),
  networks: require( './networks' ),
  tasks
}
