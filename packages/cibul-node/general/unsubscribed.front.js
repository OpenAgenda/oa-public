"use strict";

const unsubscribed = require( 'unsubscribed' );
const cmn = require( '../lib/commons-app' );
const sessions = require( 'sessions' );
const getLabel = require( 'labels' )( require( 'labels/home/notifications' ) );

/**
 * this follows a more classic way of using express.
 * The project app delegates the handling of a sub-path to
 * another app and puts a bunch of middleware before and after ( optionally )
 */

module.exports = ( parentApp, path ) => {

  unsubscribed.app.useBy( parentApp, path );

  parentApp.use( path, [ cmn.lang ] );

  parentApp.use( path, ( req, res, next ) => {

    if ( req.result.success ) {

      // do I know the language?

      sessions.setFlash( req, res, getLabel( 'unsubscribedSuccess', req.lang ) );

    } else {

      sessions.setFlash( req, res, getLabel( 'unsubscribedFail', req.lang ) );

    }

    res.redirect( '/' );

  } );

}