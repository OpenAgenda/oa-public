global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import agendasSvc from '@openagenda/agendas';
import eventsSvc from '@openagenda/events/test/service';
import _ from 'lodash';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import testconfig from './testconfig';

const mw = require( './src/middleware' );
const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  mw.init( testconfig );
  agendasSvc.init( _.merge( {}, testconfig, testconfig.services.agendas ) );
  eventsSvc.init( _.merge( {}, testconfig, testconfig.services.events ) );
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

app.use( ( req, res, next ) => {
  req.log = console.log;
  req.user = {
    // id: 27696,
    // uid: 15723194
    id: 2,
    uid: 99999999
  };
  next();
} );

app.get( '/agendas.json', mw.agendas.list );
app.get( '/events.json', mw.events.list );

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
