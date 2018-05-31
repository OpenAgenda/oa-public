"use strict";

const _ = require( 'lodash' );

const logger = require( '@openagenda/logs' );

let log;

module.exports = {
  init,
  middleware
}

const blacklist = [
  /^\/legacy/
];

function init( config ) {

  log = logger( 'incoming' );

  log.setConfig( config.getLogConfig( 'oa', 'requests' ) );

}

function middleware( req, res, next ) {

  if ( blacklist.filter( b => b.test( req.path ) ).length ) {

    return next();

  }

  if ( !blacklist.includes( req.path.split( '/' )[ 0 ] ) ) {

    log( 'info', {
      key: _.get( req, 'query.key', null ),
      path: req.path,
      query: req.query,
      extension: req.path.split( '.' ).pop(),
      url: req.originalUrl,
      ip: ( req.header( 'x-forwarded-for' ) || '' ).split( ', ' ).shift()
    } );

  }

  next();

}