"use strict";

var appName = 'auth/reset',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

w = require( 'when' ),

routes = {
  lostPassword: [ 'get', lostPassword, '/lost' ],
  lostPasswordSubmit: [ 'post', lostPasswordSubmit, '/lost' ],
  resetPassword: [ 'get', resetPassword, '/reset/:token' ],
  resetPasswordSubmit: [ 'post', resetPasswordSubmit, '/reset/:token' ]
},

log = require( '../lib/logger' )( appName ),

config = require( '../config' ),

app,

path,

userSvc = require( '../services/user/user' );

module.exports = function( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes );

  return exposed;

}

function load( main ) {

  if ( app ) {

    log( 'this app was already loaded' );

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.use( cmn.urlGenSetter( appName, path ) );

  cmn.loadRoutes( app, routes, [
    cmn.flashSetter,
    cmn.loadBaseData(),
    cmn.loadSession,
    cmn.requireUnlogged
  ] );

  return exposed;

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

  .done( _done, cmn.catchError( req, res ) );

}

function resetPassword( req, res ) {

  userSvc.lostPassword.verifyToken( { token: req.params.token } )

  .then( _ifValueIs( 'valid', true, _render( req, res, 'auth/resetPassword' ) ) )

  .then( _ifValueIsNot( 'resolved', true, _redirectToSignin( req, res, 'The link is outdated. Try again.') ) )

  .done( _done, cmn.catchError( req, res ) );

}

function resetPasswordSubmit( req, res ) {

  userSvc.lostPassword.updatePassword( { 
    token: req.params.token, 
    password: req.body.password, 
    repeat: req.body.repeat
  } )

  .then( _ifValueIs( 'success', true, _redirectToSignin( req, res, 'Your password has been updated.' )))

  .then( _ifValueIsNot( 'resolved', true, _render( req, res, 'auth/resetPassword' ) ) )

  .done( _done, cmn.catchError( req, res ) );

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

function _done( values ) {

  log( 'done.');

}


function _render( req, res, uri, data ) {

  return function( values ) {

    cmn.render( req, res, uri, values );

    values.resolved = true;

    return values;

  }

}


function _redirectToSignin( req, res, message ) {

  return function( values ) {

    cmn.redirect( req, res, 'signin', {}, message );

    values.resolved = true;

    return values;

  }

}