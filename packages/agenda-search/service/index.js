"use strict";

var logger = require( 'basic-logger' ), log,

db = require( './db' ),

searchLib = require( './search' ), search,

mw = require( './middleware' ),

deepExtend = require( 'deep-extend' ),

config;

module.exports = {
  init: init,
  list: list,
  rebuild: rebuild,
  mw: mw
}


/**
 * load up configuration in lib
 */
function init( c, cb ) {

  config = deepExtend( {
    mysql: {},
    logger: false,
    interfaces: {
      getEventStats: ( agendaId, cb ) => cb()
    }
  }, c );

  if ( config.logger ) {

    logger.setLogger( config.logger );

  }

  db.init( config );

  search = searchLib( db, config );

  mw.init( {
    list: list
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
 * rebuild the search index based on primary db data
 */
function rebuild( cb ) {

  if ( !search ) {

    return cb( 'search has not been initialized' );

  }

  search.rebuild( cb );

}