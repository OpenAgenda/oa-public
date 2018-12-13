"use strict";

const _ = require( 'lodash' );

const logger = require( '@openagenda/logs' );

const db = require( './db' );
const mw = require( './middleware' );
const searchLib = require( './search' );

let log, search, config;

module.exports = {
  init,
  list,
  rebuild: () => search.rebuild(),
  resyncUpdated: since => search.resyncUpdated( since ),
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

  config = _.merge( {
    services: {
      agendas: false
    }
  }, c );

  if ( config.logger ) {

    logger.setModuleConfig( config.logger );

  }

  search = searchLib( config );

  mw.init( {
    list,
    rebuild: search.rebuild,
    resyncUpdated: search.resyncUpdated
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
