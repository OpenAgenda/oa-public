"use strict";

const knex = require( 'knex' );
const logger = require( 'basic-logger' );
const _ = require( 'lodash' );

module.exports = endpoints => {

  function init( c ) {

    let config = _.extend( {
      knex: knex( {
        client: 'mysql',
        connection: c.mysql
      } )
    }, c );

    if ( config.logger ) {

      logger.setLogger( config.logger );

    }

    _.keys( endpoints ).forEach( e => {

      endpoints[ e ].init( endpoints, config );

    } );

  }

  return _.extend( { init }, endpoints );

}