"use strict";

const knex = require( 'knex' );
const logger = require( '@openagenda/logs' );
const _ = require( 'lodash' );

const log = logger( 'init' );

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

      logger.setModuleConfig( config.logger );

    }

    _.keys( endpoints ).filter( e => endpoints[ e ].init ).forEach( e => {

      endpoints[ e ].init( endpoints, config );

    } );

    log( 'init done' );

  }

  function shutdown( cb ) {

    config.knex.destroy( () => {

      config.legacyKnex.destroy( cb );

    } );

  }

  return _.extend( { init, shutdown }, endpoints );

}