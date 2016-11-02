"use strict";

const init = require( './service/init' );

module.exports = init( {
  //list: require( './service/list' ),
  get: require( './service/get' ),
  set: require( './service/set' ),
  //remove: require( './service/remove' );
  getConfig: require( './service/getConfig' ),
  legacy: require( './service/legacy' ),
  tasks: require( './tasks' )
} );