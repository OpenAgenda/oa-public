"use strict";

const logger = require( '@openagenda/logs' );

let log;

module.exports = {
  init,
  middleware
}

function init( config ) {

  log = logger( 'incoming' );

  log.setConfig( config.getLogConfig( 'oa', 'requests' ) );

}

function middleware( req, res, next ) {

  log( 'info', {
    path: req.path,
    query: req.query,
    extension: req.path.split( '.' ).pop(),
    url: req.originalUrl,
    ip: ( req.header( 'x-forwarded-for' ) || '' ).split( ', ' ).shift()
  } );

  next();

}