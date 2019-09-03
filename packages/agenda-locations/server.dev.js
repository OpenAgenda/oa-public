global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import testconfig from './testconfig';
import locationsEditor from './';

const mw = locationsEditor.mw( 'agendaId' );

const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  locationsEditor.init( testconfig );
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

app.use( ( req, res, next ) => {
  req.log = console.log;
  req.agendaId = 123;
  req.userUid = 456;
  next();
} );

app.get(
  '/',
  mw.list,
  ( req, res, next ) => {

    setTimeout( () => {

      res.json( {
        items: req.locations.items,
        total: req.locations.total
      } );

    }, 2000 );

  }
);

app.get( '/resync', mw.resync );
app.get( '/toverify', mw.getUnverifiedCount );
app.get( '/geocode', mw.geocode );
app.get( '/insee', mw.insee );
app.get( '/geocode/reverse', mw.reverseGeocode );
app.get( '/terms', mw.list.terms );
app.get( '/:locationUid', mw.load, ( req, res ) => res.json( req.location ) );
app.post( '/', mw.set );
app.post( '/remove', mw.remove );
app.post( '/image', mw.newImageUpload );
app.post( '/image/remove', mw.newImageRemove );

app.get( '/:locationUid/suggestion*', ( req, res, next ) => {
  // preload stakeholderId
  req.stakeholderId = 456;
  next();
} );

app.post( '/:locationUid/suggestion*', ( req, res, next ) => {
  req.stakeholderId = 456;
  next();
} );

app.post( '/:locationUid/image', mw.imageUpload );
app.post( '/:locationUid/image/remove', mw.imageRemove );
app.post( '/merge', mw.merge );

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
