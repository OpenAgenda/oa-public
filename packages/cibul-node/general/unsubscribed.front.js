"use strict";

const async = require( 'async' );
const unsubscribed = require( '@openagenda/unsubscribed' );
const sessions = require( '@openagenda/sessions' );
const agendasSvc = require( '@openagenda/agendas' );
const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/home/notifications' ) );
const cmn = require( '../lib/commons-app' );

const logged = sessions.middleware.ifUnlogged( cmn.redirectTo() );
const loadSession = sessions.middleware.load( { detailed: true } );

/**
 * this follows a more classic way of using express.
 * The project app delegates the handling of a sub-path to
 * another app and puts a bunch of middleware before and after ( optionally )
 */

module.exports = ( parentApp, path ) => {

  parentApp.get( path + unsubscribed.app.routes.list, [ logged, loadSession, ( req, res, next ) => {

    if ( req.user.uid !== parseInt( req.params.userUid ) ) {
      return next( new Error( 'userUid is different of your session' ) );
    }

    next();

  } ] );

  unsubscribed.app.useBy( parentApp, path );

  parentApp.use( path, [ cmn.lang ] );

  parentApp.get( path + unsubscribed.app.routes.list, ( req, res, next ) => {

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

  } );

  parentApp.get( path + unsubscribed.app.routes.remove, ( req, res ) => {

    if ( req.result ) return res.json( req.result );

    res.status( 400 ).json( null );

  } );

  parentApp.get( path + unsubscribed.app.routes.remove.replace( '/t/:type', '' ), ( req, res ) => {

    if ( req.result ) return res.json( req.result );

    res.status( 400 ).json( null );

  } );

  parentApp.get( path + unsubscribed.app.routes.remove.replace( '.:identifier', '' ), ( req, res ) => {

    if ( req.result ) return res.json( req.result );

    res.status( 400 ).json( null );

  } );

  parentApp.use( path, ( req, res, next ) => {

    if ( req.result && req.result.success ) {

      // do I know the language?

      sessions.setFlash( req, res, getLabel( 'unsubscribedSuccess', req.lang ) );

    } else {

      sessions.setFlash( req, res, getLabel( 'unsubscribedFail', req.lang ) );

    }

    res.redirect( '/' );

  } );

}
