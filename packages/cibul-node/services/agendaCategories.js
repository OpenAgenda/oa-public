"use strict";

const agendaCategories = require( 'agenda-categories' );

const appServiceAgendas = require( './agenda' ),

  _ = require( 'lodash' ),

  logger = require( 'logger' );

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

  agendaCategories.init( {
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