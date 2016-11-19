"use strict";

const knex = require( 'knex' );
const utils = require( 'utils' );
const logger = require( 'basic-logger' );

module.exports = endpoints => {

  function init( c ) {

    let config = utils.extend( {
      knex: knex( {
        client: 'mysql',
        connection: c.mysql
      } )
    }, c );

    if ( config.logger ) {

      logger.setLogger( config.logger );

    }

    Object.keys( endpoints ).forEach( e => {

      endpoints[ e ].init( endpoints, config );

    } );

  }

  return utils.extend( { init }, endpoints );

}