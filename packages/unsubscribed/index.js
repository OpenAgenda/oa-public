"use strict";

const _ = require( 'lodash' ),

  knexLib = require( 'knex' ),

  config = require( './service/config' ),

  endpoints = {
    is: require( './service/is' ),
    add: require( './service/add' ),
    list: require( './service/list' ),
    clear: require( './service/clear' ),
    remove: require( './service/remove' )
  };


module.exports = _.extend( userEndpoints, {
  init,
  app: require( './app' )( userEndpoints )
} );

function userEndpoints( userUid ) {

  return _.mapValues( endpoints, e => e.bind( null, userUid ) );

}

function init( c ) {

  config.set( {
    knex: knexLib( {
      client: 'mysql',
      connection: c.mysql
    } ),
    schemas: c.schemas
  } );

}