"use strict";

var logger = require( 'basic-logger' ), log,

db = require( './db' ),

searchLib = require( './search' ), search,

mw = require( './middleware' ),

deepExtend = require( 'deep-extend' ),

config;

module.exports = {
  init,
  list,
  rebuild,
  mw
}


/**
 * load up configuration in lib
 */
function init( c, cb ) {

  config = deepExtend( {
    logger: false,
    services: {
      agendas: false
    }
  }, c );

  if ( config.logger ) {

    logger.setLogger( config.logger );

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