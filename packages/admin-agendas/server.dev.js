global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import agendasSvc from '@openagenda/agendas';
import MembersSvc from '@openagenda/members';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import testconfig from './testconfig';
import service from './service';

const mw = service.mw;
const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

const membersSvc = MembersSvc(testconfig);

if ( process.env.NODE_ENV !== 'test' ) {
  agendasSvc.init( testconfig );
  service.init( Object.assign( {}, testconfig, {
    services: {
      agendas: agendasSvc,
      members: membersSvc
    }
  } ) );
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

app.get( '/', mw.agendas.list );
app.get( '/get', mw.agendas.get );
app.post( '/set/:uid', mw.agendas.set );
app.get( '/members', mw.members.list );

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
