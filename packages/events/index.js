"use strict";

const init = require( './service/init' );

module.exports = init( {
  list: require( './service/list' ),
  get: require( './service/get' ),
  set: require( './service/set' ),
  remove: require( './service/remove' ),
  deleted: require( './service/deleted' ),
  legacy: require( './service/legacy' ),
  stats: require( './service/stats' ),
  getConfig: require( './service/getConfig' ),
  tasks: require( './tasks' )
} );