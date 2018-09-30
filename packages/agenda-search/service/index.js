"use strict";

const deepExtend = require( 'deep-extend' );

const logger = require( '@openagenda/logs' );

const db = require( './db' );
const mw = require( './middleware' );
const searchLib = require( './search' );

let log, search, config;

module.exports = {
  init,
  list,
  rebuild,
  mw,
  getClient: () => {

    if ( !search ) return null;

    return search.getClient();

  }
}


/**
 * load up configuration in lib
 */
function init( c ) {

  config = deepExtend( {
    services: {
      agendas: false
    }
  }, c );

  if ( config.logger ) {

    logger.setModuleConfig( config.logger );

  }

  search = searchLib( config.services.agendas, config );

  mw.init( {
    list,
    rebuild
  }, config );

}


/**
 * get a list of agendas matching the query
 */
function list( query, offset, limit, cb ) {

  if ( !search ) {

    return cb( 'search has not been initialized' );

  }

  search.list( query, offset, limit, cb );

}


/**
 * rebuild the search index based on data provided by agenda service
 */
function rebuild( cb ) {

  if ( !search ) {

    return cb( 'search has not been initialized' );

  }

  search.rebuild( err => {

    if ( cb ) cb( err );

  } );

}
