"use strict";

const knex = require( 'knex' );
const logger = require( '@openagenda/basic-logger' );
const _ = require( 'lodash' );

module.exports = endpoints => {

  let config = {}

  function init( c ) {

    _.extend( config, {
      knex: knex( {
        client: 'mysql',
        connection: c.mysql
      } ),
      legacyKnex: knex( {
        client: 'mysql',
        connection: c.legacy.mysql
      } )
    }, c );

    if ( config.logger ) {

      logger.setLogger( config.logger );

    }

    _.keys( endpoints ).forEach( e => {

      endpoints[ e ].init( endpoints, config );

    } );

  }

  function shutdown( cb ) {

    config.knex.destroy( () => {

      config.legacyKnex.destroy( cb );

    } );

  }

  return _.extend( { init, shutdown }, endpoints );

}