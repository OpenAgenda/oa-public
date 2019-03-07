global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import bodyParser from 'body-parser';
import service from './src/service';
import keysSvc from '@openagenda/keys';
import * as keysMw from '@openagenda/keys/middleware';
import agendasSvc from '@openagenda/agendas';
import testconfig from './testconfig';

const mw = require( './src/middleware' );
const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  (async () => {
    agendasSvc.init( testconfig );

    service.init( Object.assign( testconfig, {
      services: {
        agendas: agendasSvc
      }
    } ) );

    // avoid migrations and do it in fixtures.js
    await keysSvc.init( Object.assign( testconfig, { migrations: null } ) );
  })();
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

/*******/

app.use( ( req, res, next ) => {
  req.user = { id: 2 };
  req.agenda = {
    uid: 17026855,
    slug: 'proces-d-assises-2016'
  }
  next();
} );

app.post( '/', mw.create );
app.get( '/:uid/agenda.json', mw.get );
app.post( '/:slug/edit', mw.set );
app.post( '/:slug/setImage', mw.setImage );
app.post( '/:slug/clearImage', mw.clearImage );
app.post( '/slugs/available', mw.slugs.available );
app.post( '/:slug/remove', [
  mw.removeAgenda,
  ( req, res ) => {
    res.json( { redirectTo: '/' } );
  }
] );

app.post( '/:slug/keys/create',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid
    };
    next();
  },
  keysMw.create(),
  ( req, res, next ) => res.send( req.result )
);

app.get( '/:slug/keys/get',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid,
      key: req.query.key
    };
    next();
  },
  keysMw.get(),
  ( req, res, next ) => res.send( req.result )
);

app.get( '/:slug/keys/list',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid
    };
    req.options = { total: true };
    next();
  },
  keysMw.list(),
  ( req, res, next ) => res.send( req.result )
);

app.patch( '/:slug/keys/update',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid,
      key: req.query.key
    };
    next();
  },
  keysMw.update(),
  ( req, res, next ) => res.send( req.result )
);

app.delete( '/:slug/keys/remove',
  ( req, res, next ) => {
    req.identifiers = {
      type: 'agendaFullRead',
      identifier: req.agenda.uid,
      key: req.query.key
    };
    next();
  },
  keysMw.remove(),
  ( req, res, next ) => res.send( { rowAffected: req.result } )
);

/*******/

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
