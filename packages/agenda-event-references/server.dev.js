global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import _ from 'lodash';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import testconfig from './testconfig';
import svc from './';

testconfig.interfaces.events = require( './stories/app/eventSearch.interface' );
testconfig.interfaces.suggestions = require( './stories/app/eventSuggestions.interface' );

const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  svc.init( testconfig, _.noop );
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

app.get( /\/(events|suggestions)/, ( req, res, next ) => { setTimeout( () => { next(); } , 2000 ); } );

app.get( '/events', ( req, res, next ) => {
  req.agendaId = 123;
  next();
} );

app.get( '/events', svc.mw.events );

app.get( '/suggestions', ( req, res, next ) => {
  req.agendaUid = 456;
  next();
} );

app.get( '/suggestions', svc.mw.suggestions );
app.get( /\/(events|suggestions)/, ( req, res ) => res.json( req.events ) );

app.use( errorHandler( { log: true } ) );

if ( process.env.NODE_ENV !== 'test' ) {
  server.listen( process.env.PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Dev server started on => http://localhost:${server.address().port}/`
    );
  } );
}

export default app;
