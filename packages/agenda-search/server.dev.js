global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import agendasSvc from '@openagenda/agendas';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import testconfig from './testconfig';
import service from './';
import listInterface from './test/app/listInterface';

const mw = service.mw;
const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  agendasSvc.init( testconfig );
  service.init( Object.assign( testconfig, {
    services: {
      agendas: agendasSvc
    },
    interfaces: {
      list: listInterface.bind( null, 100 )
    }
  } ) );

  service.rebuild();
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

app.use( ( req, res, next ) => {
  req.log = console.log;
  req.lang = 'fr';
  next();
} );

app.get( '/', mw.list );
app.get( '/:format', mw.list );

app.use( ( req, res, next ) => {
  if ( req.content ) {
    res.send( req.content );
  }

  next();
} )

app.use( errorHandler( { log: true } ) );

if ( process.env.NODE_ENV !== 'test' ) {
  server.listen( process.env.PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(
      `\nDev server started on => http://localhost:${server.address().port}/`
    );
  } );
}

export default app;
