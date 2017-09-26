"use strict";

const agendaTags = require( 'agenda-tags' );

const appServiceAgendas = require( './agenda' ),

  _ = require( 'lodash' ),

  logger = require( 'logger' );

module.exports.init = ( config, cb ) => {

  function _query( queryStr, values, cb ) {

    const query = config.knex.raw( queryStr, values );

    query.then( result => result[ 0 ] ).then( rows => {

      process.nextTick( () => cb( null, rows ) );

    } );

    query.catch( err => {

      process.nextTick( () => cb( err ) );

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