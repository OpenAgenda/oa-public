"use strict";

const knex = require( 'knex' );
const logger = require( '@openagenda/logs' );
const _ = require( 'lodash' );

const log = logger( 'init' );

module.exports = endpoints => {

  const config = {}

  function init( c ) {

    _.assign( config, c );

    if ( !config.knex ) {

      config.knex = knex( {
        client: 'mysql',
        connection: c.mysql
      } );

    }

    if ( !config.legacyKnex ) {

      config.legacyKnex = knex( {
        client: 'mysql',
        connection: c.legacy.mysql
      } );

    }

    if ( config.logger ) {

      logger.setModuleConfig( config.logger );

    }

    _.keys( endpoints ).filter( e => endpoints[ e ].init ).forEach( e => {

      endpoints[ e ].init( endpoints, config );

    } );

  }

  function shutdown( cb ) {

    if ( !config.knex ) return cb();

    config.knex.destroy( () => {

      config.knex = null;

      config.legacyKnex.destroy( err => {

        config.legacyKnex = null;

        cb( err );

      } );

    } );

  }

  return _.extend( { init, shutdown }, endpoints );

}
