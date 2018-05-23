"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );

const logger = require( '@openagenda/logs' );

const config = require( './service/config' );

const endpoints = {
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
    schemas: c.schemas,
  } );

  if ( c.logger ) {

    logger.setModuleConfig( c.logger );

  }

}