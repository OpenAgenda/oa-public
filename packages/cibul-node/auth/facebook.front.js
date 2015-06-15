"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

pLib = require( './lib/passport' ),

auth = require( './lib/auth' )( 'facebook' ),

w = require( 'when' ),

log = require( '../lib/logger' )( 'auth/facebook' ),

genUrl = require( '../services/genUrl' ),

routes = {
  facebookSignin: [ 'get', '/signin', signin ],
  facebookSigninCallback: [ 'get', '/signin/callback', signinCallback ],
  facebookSignup: [ 'get', '/signup', signup ],
  facebookSignupCallback: [ 'get', '/signup/callback', signupCallback ]
};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  log( 'initing' );

  router.pre( [
    cmn.flashSetter,
    cmn.loadBaseData( auth.layoutData ),
    cmn.loadSession,
    cmn.requireUnlogged
  ] );

  return {
    load: load( router, path ),
    paths: modLib.getPaths( path, routes )
  }
  
}


function load( router, path ) {

  var facebookOptions = {
    clientID: config.auth.facebook.id,
    clientSecret: config.auth.facebook.secret,
    passReqToCallback: true,
    authorizationURL: "https://www.facebook.com/v2.0/dialog/oauth"
  };

  return function( app ) {

    pLib.loadStrategy( 'facebook', 'passport-facebook' );

    pLib.use( 'facebook-signin', 'facebook', lib.extend( {
      callbackURL: genUrl.abs( 'facebookSigninCallback' )
    }, facebookOptions ), _loadFacebookProfile );

    pLib.use( 'facebook-signup', 'facebook', lib.extend( {
      callbackURL: genUrl.abs( 'facebookSignupCallback' )
    }, facebookOptions ), _loadFacebookProfile );

    return router.load( path )( app );

  }

}


/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res );

  pLib.authenticate( 'facebook-signin', {
    scope: 'email', 
    callbackURL: genUrl.abs( 'facebookSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  auth.saveOptionals( req, res );

  pLib.authenticate( 'facebook-signup', {
    scope: 'email', 
    callbackURL: genUrl.abs( 'facebookSignupCallback' )
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
    fullName: profile.name.givenName + ' ' + profile.name.familyName
  };

  if ( profile.emails && profile.emails.length > 0 ) {

    extracted.email = profile.emails[ 0 ].value;

  }

  done( null, extracted );

}