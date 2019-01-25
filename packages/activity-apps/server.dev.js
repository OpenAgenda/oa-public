global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import bodyParser from 'body-parser';
import sessions from '@openagenda/sessions';
import sessionsMw from '@openagenda/sessions/middleware';
import activitiesSvc from '@openagenda/activities/test/service';
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
    sessions.init( testconfig.services.sessions );
    mw.init( { limit: testconfig.mw.limit, services: { activities: activitiesSvc } } );
    await activitiesSvc.init( Object.assign( testconfig, { migrations: null } ) );
  })();
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( sessionsMw );
app.use( cors() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

app.use( ( req, res, next ) => {
  req.user = {
    uid: 99999999,
    id: 2,
    lang: req.query.lang || 'fr'
  }; // 2 == administrator, 4387 == contributor
  req.userIdentifier = req.user;
  req.identifiers = { userId: req.user.id };
  req.agenda = { id: 4608, uid: 36282888 };

  next();
} );

app.use( sessionsMw.open() );

app.get( '/notifications/count', mw.notifications.count );
app.get( '/notifications/list', mw.notifications.list );
app.get( '/notifications/remove/:notifId', mw.notifications.remove );
app.get( '/notifications/mark-read/:notifId', mw.notifications.markRead );
app.get( '/notifications/mark-all-read', mw.notifications.markAllRead );

// for admin
app.get( '/admin/list', mw.list() );

// for agenda
app.get(
  '/agenda/list',
  ( req, res ) => mw.list( {
    entityType: 'agenda',
    entityUid: req[ 'agenda' ].uid
  } )( req, res )
);

// for user
app.get(
  '/user/list',
  ( req, res ) => mw.list( {
    entityType: 'user',
    entityUid: req[ 'user' ].uid
  } )( req, res )
);

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
