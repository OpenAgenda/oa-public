"use strict";

module.exports = init;

var appName = 'auth/facebook',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

routes = {
  facebookSignin: [ 'get', signin, '/signin' ],
  facebookSigninCallback: [ 'get', signinCallback, '/signin/callback' ],
  facebookSignup: [ 'get', signup, '/signup' ],
  facebookSignupCallback: [ 'get', signupCallback, '/signup/callback' ]
},

log = require( '../lib/logger' )( appName ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

app,

path,

pLib = require( './lib/passport' ),

auth = require( './lib/auth' )( 'facebook' ),

w = require( 'when' );

function init( p ) {

  var facebookOptions = {
    clientID: config.auth.facebook.id,
    clientSecret: config.auth.facebook.secret,
    passReqToCallback: true,
    authorizationURL: "https://www.facebook.com/v2.0/dialog/oauth"
  };

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes );

  pLib.loadStrategy( 'facebook', 'passport-facebook' );
  
  pLib.use( 'facebook-signin', 'facebook', lib.extend( {
    callbackURL: auth.genUrl( 'facebookSigninCallback' )
  }, facebookOptions ), _loadFacebookProfile );

  pLib.use( 'facebook-signup', 'facebook', lib.extend( {
    callbackURL: auth.genUrl( 'facebookSignupCallback' )
  }, facebookOptions ), _loadFacebookProfile );

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

  pLib.authenticate( 'facebook-signin', {
    scope: 'email', 
    callbackURL: auth.genUrl( 'facebookSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  auth.saveOptionals( req, res );

  pLib.authenticate( 'facebook-signup', {
    scope: 'email', 
    callbackURL: auth.genUrl( 'facebookSignupCallback' )
  } )( req, res, next );

}

function signinCallback( req, res, next ) {

  auth.restoreOptionals( req, res );

  pLib.authenticate( 'facebook-signin', {}, function( err, profile, data ) {

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

  pLib.authenticate( 'facebook-signup', {}, function( err, profile, data ) {

    w( { req: req, res: res, err: err, profile: profile, data: data } )

    .then( auth.attemptCreate )

    .then( auth.ifUserLoaded( false, auth.errors.existingEmail ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.attemptAuth ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.defaultMessage  )) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.signin ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( auth.done , cmn.catchError( req, res ) );

  } )( req, res, next );

}


function _loadFacebookProfile( req, token, refreshToken, profile, done ) {


  var extracted = {
    id: profile.id,
    fullName: profile.name
  };

  if ( profile.emails && profile.emails.length > 0 ) {

    extracted.email = profile.emails[ 0 ].value;

  }

  done( null, extracted );

}