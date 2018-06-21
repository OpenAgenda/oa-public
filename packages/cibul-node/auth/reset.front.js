"use strict";

const bodyMw = require( 'body-parser' ).urlencoded( {
  extended: true,
  limit: 500000
} );

const sessions = require( '@openagenda/sessions' ),

  modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  config = require( '../config' ),

  w = require( 'when' ),

  userSvc = require( '../services/user' ),

  routes = {
    lostPassword: [ 'get', '/lost', lostPassword ],
    lostPasswordSubmit: [ 'post', '/lost', lostPasswordSubmit ],
    resetPassword: [ 'get', '/reset/:token', resetPassword ],
    resetPasswordSubmit: [ 'post', '/reset/:token', resetPasswordSubmit ]
  };


module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadBaseData(),
    sessions.middleware.ifLogged( cmn.redirectTo() ),
    bodyMw
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


/**
 * controllers
 */

function lostPassword( req, res ) {

  cmn.render( req, res, 'auth/lostPassword' );

}

function lostPasswordSubmit( req, res ) {

  userSvc.lostPassword.createAndSend( { email: req.body.email  } )

  .then( _ifValueIs( 'sent', true, _redirectToSignin( req, res, 'A password reset is being sent to your email' ) ) )

  .then( _ifValueIsNot( 'sent', true, _render( req, res, 'auth/lostPassword' ) ) )

  .done( function() { req.log( 'done' ); }, cmn.catchError( req, res ) );

}

function resetPassword( req, res ) {

  userSvc.lostPassword.verifyToken( { token: req.params.token } )

  .then( _ifValueIs( 'valid', true, _render( req, res, 'auth/resetPassword' ) ) )

  .then( _ifValueIsNot( 'resolved', true, _redirectToSignin( req, res, 'The link is outdated. Try again.') ) )

  .done( function() { req.log( 'done' ); }, cmn.catchError( req, res ) );

}

function resetPasswordSubmit( req, res ) {

  userSvc.lostPassword.updatePassword( { 
    token: req.params.token, 
    password: req.body.password, 
    repeat: req.body.repeat
  } )

  .then( _ifValueIs( 'success', true, _redirectToSignin( req, res, 'Your password has been updated.' )))

  .then( _ifValueIsNot( 'resolved', true, _render( req, res, 'auth/resetPassword' ) ) )

  .done( function() { req.log( 'done' ); }, cmn.catchError( req, res ) );

}


function _ifValueIs( name, expected, func ) {

  return function( values ) {

    if ( expected == values[ name ] ) return func( values );

    return values;

  }

}

function _ifValueIsNot( name, expected, func ) {

  return function( values ) {

    if ( expected !== values[ name ] ) return func( values );

    return values;

  }

}


function _render( req, res, uri, data ) {

  return function( values ) {

    cmn.render( req, res, uri, values );

    values.resolved = true;

    return values;

  }

}


function _redirectToSignin( req, res, message ) {

  return values => {

    sessions.setFlash( req, res, message );

    res.redirect( 302, req.genUrl( 'signin' ) );

    values.resolved = true;

    return values;

  }

}