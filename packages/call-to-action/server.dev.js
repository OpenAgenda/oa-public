global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import sessions from '@openagenda/sessions';
import sessionsMw from '@openagenda/sessions/middleware';
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
  sessions.init( testconfig.services.sessions );
  mw.init( { emailDestination: testconfig.emailDestination } );
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
    uid: 99999999,
    id: 2,
    email: 'kaore.olafsson@gmail.com',
    lang: req.query.lang || 'fr'
  }; // 2 == administrator, 4387 == contributor
  next();
} );

app.use( sessionsMw.open() );
app.post( '/request', mw.request() );

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
