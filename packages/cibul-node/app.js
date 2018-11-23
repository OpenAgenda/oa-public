"use strict";

const _ = require( 'lodash' );
const http = require( 'http' );
const express = require( 'express' );
const sessions = require( '@openagenda/sessions' );
const logger = require( '@openagenda/logger' );
const cmn = require( './lib/commons-app' );
const errorLogger = require( './services/00_errors' );
const genUrl = require( './services/genUrl' ).getSingleton();

const admin = require( './admin' );
const web = require( './web' );
const webAndTask = [
  require( './legacy/back' )( '/legacy' )
];

const { ADMIN, WEB, TASK } = process.env;

const app = express();
const server = http.createServer( app );

app.server = server;

app.set( 'trust proxy', 'loopback' );

app.use( sessions.middleware );

app.use( ( req, res, next ) => {
  res.setHeader( 'X-Powered-By', 'OpenAgenda' );
  next();
} );

app.use( require( './services/logRequests' ).middleware );

// load gen url everywhere
app.use( ( req, res, next ) => {
  req.genUrl = genUrl.copy(); // need genUrl only for request lifecycle
  next();
} );

app.use( ( req, res, next ) => {
  req.log = logger( 'req' );
  req.log.load( { url: req.originalUrl } );
  next();
} );

app.use( cmn.lang );

cmn.loadLegacyRoutes( genUrl );

web.webModules
  .concat( admin.webModules )
  .concat( webAndTask )
  .forEach( m => genUrl.load( m.paths ) );

// run 'admin' type modules
if ( ADMIN ) {
  admin( app );
}

// run 'web' type modules
if ( WEB ) {
  web( app );
}

if ( TASK || WEB ) {
  webAndTask.forEach( m => m.load( app ) );

  // delegate more to repo-ed services
  require( './general/unsubscribed.front' )( app, '/unsubscribe' );
  require( './agenda/json.export' )( app, '/' );
  require( './agenda/exports' )( app, '/' );
}

app.use( ( req, res, next ) => {
  next( { code: 404 } );
} );

app.use( ( err, req, res, next ) => {
  // 404s and co are not to be logged by error handler
  if ( ![ 401, 403, 404, 413 ].includes( _.get( err, 'code', null ) ) ) {
    errorLogger( 'middleware', err );
  }

  return cmn.catchError( req, res )( err );
} );

module.exports = app;
