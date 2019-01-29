global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

import http from 'http';
import usersSvc from '@openagenda/users';
import usersSvcHooks from '@openagenda/users/hooks';
import unsubscribedSvc from '@openagenda/unsubscribed';
import filesSvc from '@openagenda/files';
import keysSvc from '@openagenda/keys';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import async from 'async';
import testconfig from './testconfig';

const app = express();

export const server = http.createServer( app );

app.server = server;

/*
 * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
 * */

if ( process.env.NODE_ENV !== 'test' ) {
  (async () => {
    filesSvc.init( testconfig.files );
    await usersSvc.init( testconfig );
    unsubscribedSvc.init( testconfig );
    await keysSvc.init( testconfig );
  })();
}

if ( [ 'development', 'test' ].includes( process.env.NODE_ENV ) ) {
  app.use( morgan( 'dev' ) );
}

app.use( cors() );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

app.use( ( req, res, next ) => {
  req.user = {
    id: 1,
    uid: 75052324,
    lang: req.query.lang || 'fr'
  };
  next();
} );

/********/

const { app: userApp, exposeApp } = usersSvc;

userApp.use( ( req, res, next ) => {

  req.feathers.user = req.user;
  req.feathers.authenticated = req.authenticated = !!req.user;

  next();

} );

// transform uid 'me' to the uid of the current user
userApp.param( '__feathersId', ( req, res, next, uid ) => {
  if ( uid !== 'me' ) {
    return next();
  }

  if ( !req.user || !req.user.uid ) {
    return next( new errors.NotAuthenticated( 'You should be logged' ) );
  }

  req.params.__feathersId = req.user.uid;

  next();
} );

exposeApp( app, '/users' );
usersSvc.hooks( usersSvcHooks );


unsubscribedSvc.app.useBy( app );

app.get( unsubscribedSvc.app.routes.remove, ( req, res ) => {

  if ( req.result ) return res.json( req.result );

  res.status( 400 ).json( null );

} );

app.get( unsubscribedSvc.app.routes.remove.replace( '.:identifier', '' ), ( req, res ) => {

  if ( req.result ) return res.json( req.result );

  res.status( 400 ).json( null );

} );

app.get( unsubscribedSvc.app.routes.list, ( req, res, next ) => {

  if ( req.result ) {

    if ( req.result.unsubscriptions ) {

      return async.eachOfSeries( req.result.unsubscriptions, ( item, key, cb ) => {

        if ( item.subject !== 'agenda' ) return cb();

        _getAgenda( item.identifier, ( err, agenda ) => {

          if ( err ) return cb( err );

          req.result.unsubscriptions[ key ].agenda = agenda;

          cb();

        } );

      }, err => {

        if ( err ) return next( err );

        return res.json( req.result );

      } );

    }

  }

  next();

} );

/********/

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


function _getAgenda( agendaUid, cb ) {

  return cb( null, agendaUid === 85870128 ? {
    slug: 'journees-arts-culture-sup-2017',
    title: '2017 : Journées des Arts et de la Culture dans l\'Enseignement Supérieur'
  } : {
    slug: 'semaineindustrie2017',
    title: 'Semaine de l\'Industrie 2017'
  } );

}
