"use strict";

const async = require( 'async' );
const unsubscribed = require( '@openagenda/unsubscribed' );
const sessions = require( '@openagenda/sessions' );
const agendasSvc = require( '@openagenda/agendas' );
const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/home/notifications' ) );
const cmn = require( '../lib/commons-app' );

const logged = sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) );

/**
 * this follows a more classic way of using express.
 * The project app delegates the handling of a sub-path to
 * another app and puts a bunch of middleware before and after ( optionally )
 */

module.exports = app => {

  app.get(
    '/unsubscribe' + unsubscribed.app.routes.list,
    cmn.lang,
    logged,
    ( req, res, next ) => {

      if ( req.user.uid !== parseInt( req.params.userUid ) ) {
        return next( new Error( 'userUid is different of your session' ) );
      }

      next();

    }
  );

  unsubscribed.app.useBy( app, '/unsubscribe' );

  app.get(
    '/unsubscribe' + unsubscribed.app.routes.list,
    cmn.lang,
    ( req, res, next ) => {

      if ( req.result ) {

        if ( req.result.unsubscriptions ) {

          return async.eachOfSeries( req.result.unsubscriptions, ( item, key, cb ) => {

            if ( item.subject !== 'agenda' ) return cb();

            agendasSvc.get( { uid: item.identifier }, { private: null }, ( err, agenda ) => {

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

    }
  );

  app.get(
    '/unsubscribe' + unsubscribed.app.routes.remove,
    cmn.lang,
    ( req, res ) => {

      if ( req.result ) return res.json( req.result );

      res.status( 400 ).json( null );

    }
  );

  app.get(
    '/unsubscribe' + unsubscribed.app.routes.remove.replace( '/t/:type', '' ),
    ( req, res ) => {

      if ( req.result ) return res.json( req.result );

      res.status( 400 ).json( null );

    }
  );

  app.get(
    '/unsubscribe' + unsubscribed.app.routes.remove.replace( '.:identifier', '' ),
    cmn.lang,
    ( req, res ) => {

      if ( req.result ) return res.json( req.result );

      res.status( 400 ).json( null );

    }
  );

  app.use(
    '/unsubscribe',
    cmn.lang,
    ( req, res, next ) => {

      if ( req.result && req.result.success ) {

        // do I know the language?

        sessions.setFlash( req, res, getLabel( 'unsubscribedSuccess', req.lang ) );

      } else {

        sessions.setFlash( req, res, getLabel( 'unsubscribedFail', req.lang ) );

      }

      res.redirect( '/' );

    }
  );

}
