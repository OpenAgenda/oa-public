"use strict";

const agendaTags = require( 'agenda-tags' );

const appServiceAgendas = require( './agenda' ),

  _ = require( 'lodash' ),

  logger = require( '@openagenda/logger' );

module.exports.init = ( config, cb ) => {

  function _query( queryStr, values, cb ) {

    const query = config.knex.raw( queryStr, values );

    query
      .then(
        result => result[ 0 ],
        err => {

          process.nextTick( () => cb( err ) );

        }
      )
      .then( rows => {

        process.nextTick( () => cb( null, rows ) );

      } );

  }

  agendaTags.init( {
    store: {
      query: _query
    },
    legacy: {
      query: _query
    },
    logger,
    interfaces: appServiceAgendas.tagsAndCategories
  }, cb );

}