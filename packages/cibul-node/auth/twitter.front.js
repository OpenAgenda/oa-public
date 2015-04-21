"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

log = require( '../lib/logger' )( 'auth/twitter' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

userSvc = require( '../services/user/user' ),

pLib = require( './lib/passport' ),

auth = require( './lib/auth' )( 'twitter' ),

deepExtend = require( 'deep-extend' ),

w = require( 'when' ),

routes = {
  twitterSignin: [ 'get', '/signin', signin ],
  twitterSigninCallback: [ 'get', '/signin/callback', signinCallback ],
  twitterSignup: [ 'get', '/signup', signup ],
  twitterSignupCallback: [ 'get', '/signup/callback', signupCallback ]
};


module.exports = function( path ) {

  var router = modLib.Router( routes );

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

  var twitterOptions = {
    consumerKey: config.auth.twitter.key,
    consumerSecret: config.auth.twitter.secret,
    passReqToCallback: true,
    skipExtendedUserProfile: true
  };

  return function( app ) {

    pLib.loadStrategy( 'twitter', 'passport-twitter' );

    pLib.use( 'twitter-signin', 'twitter', lib.extend( {
      callbackURL: auth.genUrl( 'twitterSigninCallback' )
    }, twitterOptions ), _loadTwitterProfile );

    pLib.use( 'twitter-signup', 'twitter', lib.extend({
      callbackURL: auth.genUrl( 'twitterSignupCallback' )
    }, twitterOptions ), _loadTwitterProfile );

    return router.load( path )( app );

  }

}


/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res );

  pLib.authenticate( 'twitter-signin', {
    callbackURL: auth.genUrl( 'twitterSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  if ( req.query.email ) {

    log( 'retrieved email %s', req.query.email );

    auth.saveOptionals( req, res, { email: req.query.email } );

    pLib.authenticate( 'twitter-signup', {
      callbackURL: auth.genUrl( 'twitterSignupCallback' )
    })( req, res, next );

  } else {

    auth.renderEmail( req, res, { uri: 'twitterSignup' } );

  }

}

function signinCallback( req, res, next ) {

  auth.restoreOptionals( req, res );

  pLib.authenticate( 'twitter-signin', {}, function( err, profile, data ) {

    w( { err: err, profile: profile, req: req, res: res } )

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, _attemptUsernameLoad ) )

    .then( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToResend ) ) )

    .then( auth.ifUserLoaded( false, _attemptTwitterCreate ))

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.defaultMessage ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToComplete ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( function( values ) {

      log( 'signinCallback controller complete' );

    }, cmn.catchError( req, res ) );

  } )(req, res, next );

}


function signupCallback( req, res, next ) {

  auth.restoreOptionals( req, res );

  pLib.authenticate( 'twitter-signup', {}, function( err, profile, data ) {

    w( { req: req, res: res, err: err, profile: profile, data: data } )

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, _attemptTwitterCreate ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToComplete ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( auth.done , cmn.catchError( req, res ) );

  })( req, res, next );

}

function _attemptTwitterCreate( values ) {

  return w( values )

  .then( _renderEmailFormIfNoProfileEmail( values ) )

  .then( auth.attemptCreate )

  .then( auth.ifUserLoaded( false, auth.errors.existingEmail ) );

}



function _loadTwitterProfile( req, token, refreshToken, profile, done ) { 

  var extracted = {
    id: profile.id,
    fullName: profile.username
  };

  if ( req.query.email ) {

    extracted.email = req.query.email;

  }

  done( null, extracted );

}


function _attemptUsernameLoad( values ) {

  return w.promise( function( resolve, reject ) {

    userSvc.auth.twitterScreenName( values.profile.fullName, auth.loadOptionals( values.req ), function( err, user, data ) {

      if ( err ) values.err = err;

      if ( user ) values.user = user;

      if ( data ) deepExtend( values.data, data );

      resolve( values );

      // do this while you are at it
      if ( user ) {

        userSvc.updateTwitterId( user, values.profile );

      }

    });

  });

}


function _renderEmailFormIfNoProfileEmail( values ) {

  if ( !values.req.query.email ) {

    values.data = { uri: 'twitterSignup' };

    return auth.renderEmail( lib.extend( values, { uri: 'twitterSignup' } ) );

  }

  return values;

}