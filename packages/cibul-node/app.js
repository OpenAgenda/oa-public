"use strict";

const _ = require( 'lodash' );
const http = require( 'http' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const sessions = require( '@openagenda/sessions' );
const logger = require( '@openagenda/logs' );
const cmn = require( './lib/commons-app' );
const genUrl = require( './services/genUrl' ).getSingleton();

const admin = require( './admin' );
const web = require( './web' );

const { ADMIN, WEB, TASK } = process.env;

const app = express();
const server = http.createServer( app );

app.server = server;

app
  .set( 'trust proxy', 'loopback' )
  .use( bodyParser.json( { limit: '5mb' } ) )
  .use( bodyParser.urlencoded( { limit: '500kb', extended: true } ) )
  .use( sessions.middleware )
  .use( sessions.middleware.load( { detailed: true } ) )

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

  req.log = logger( 'req', { url: req.originalUrl } );

  next();

} );

app.use( cmn.lang );

cmn.loadLegacyRoutes( genUrl );

// run 'admin' type modules
if ( ADMIN ) {
  admin( app );
}

// run 'web' type modules
if ( WEB ) {
  web( app );
}

if ( TASK || WEB ) {
  require( './legacy/back' )( app );
  require( './general/unsubscribed.front' )( app );
  require( './agenda/json.export' )( app );
  require( './agenda/exports' )( app );
}

app.use( ( req, res, next ) => next( { code: 404 } ) );

app.use( ( err, req, res, next ) => cmn.catchError( req, res )( err ) );

module.exports = app;
