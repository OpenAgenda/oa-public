"use strict";

module.exports = init;

var appName = 'auth/google',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

routes = {
  googleSignin: [ 'get', signin, '/signin' ],
  googleSigninCallback: [ 'get', signinCallback, '/signin/callback' ],
  googleSignup: [ 'get', signup, '/signup' ],
  googleSignupCallback: [ 'get', signupCallback, '/signup/callback' ]
},

log = require( '../lib/logger' )( appName ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

app,

path,

pLib = require( './lib/passport' ),

auth = require( './lib/auth' )( 'google' ),

w = require( 'when' );

function init( p ) {

  var googleOptions = {
    clientID: config.auth.google.id,
    clientSecret: config.auth.google.secret,
    passReqToCallback: true
  };

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes );

  pLib.loadStrategy( 'google', 'passport-google-oauth', 'OAuth2Strategy' );
  
  pLib.use( 'google-signin', 'google', lib.extend( {
    callbackURL: auth.genUrl( 'googleSigninCallback' )
  }, googleOptions ), _loadGoogleProfile );

  pLib.use( 'google-signup', 'google', lib.extend( {
    callbackURL: auth.genUrl( 'googleSignupCallback' )
  }, googleOptions ), _loadGoogleProfile );

  return exposed;

}

function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded' );

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.use( cmn.urlGenSetter( appName, path ) );

  cmn.loadRoutes( app, routes, [
    cmn.flashSetter,
    cmn.loadBaseData( auth.layoutData ),
    cmn.loadSession,
    cmn.requireUnlogged
  ] );

  return exposed;

}



/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res );

  pLib.authenticate( 'google-signin', {
    scope: 'email', 
    callbackURL: auth.genUrl( 'googleSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  auth.saveOptionals( req, res );

  pLib.authenticate( 'google-signup', {
    scope: 'email', 
    callbackURL: auth.genUrl( 'googleSignupCallback' )
  } )( req, res, next );

}

function signinCallback( req, res, next ) {

  auth.restoreOptionals( req, res );

  pLib.authenticate( 'google-signin', {}, function( err, profile, data ) {

    w( { err: err, profile: profile, req: req, res: res })

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, auth.attemptCreate ) )

    .then( auth.ifUserLoaded( false, auth.errors.existingEmail ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.signin ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.defaultMessage ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignin ) ) )

    .done( auth.done , cmn.catchError( req, res ) );

  } )( req, res, next );

}


function signupCallback( req, res, next ) {

  auth.restoreOptionals( req, res );

  pLib.authenticate( 'google-signup', {}, function( err, profile, data ) {

    w( { req: req, res: res, err: err, profile: profile, data: data } )

    .then( auth.attemptCreate )

    .then( auth.ifUserLoaded( false, auth.errors.existingEmail ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.attemptAuth ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.signin ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.defaultMessage  )) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( auth.done , cmn.catchError( req, res ) );

  } )( req, res, next );

}




function _loadGoogleProfile( req, token, refreshToken, profile, done ) {

  var extracted = {
    id: profile.id,
    fullName: profile.displayName
  };

  if ( profile.emails && profile.emails.length > 0 ) {

    extracted.email = profile.emails[ 0 ].value;

  }

  done( null, extracted );

}