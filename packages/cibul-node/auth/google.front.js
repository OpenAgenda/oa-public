"use strict";

const _ = require( 'lodash' );

const modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  config = require( '../config' ),

  lib = require( '../lib/lib' ),

  pLib = require( './lib/passport' ),

  auth = require( './lib/auth' )( 'google' ),

  genUrl = require( '../services/genUrl' ),

  agendaSvc = require( '../services/agenda' ),

  w = require( 'when' ),

  routes = {
    googleSignin: [ 'get', '/google/signin', signin ],
    agendaGoogleSignin: [ 'get', '/:slug/google/signin', signin ],
    googleSigninCallback: [ 'get', '/google/signin/callback', auth.serviceCallback( auth.process( 'google', 'signin' ) ) ],
    googleSignup: [ 'get', '/google/signup', signup ],
    agendaGoogleSignup: [ 'get', '/:slug/google/signup', signup ],
    googleSignupCallback: [ 'get', '/google/signup/callback', auth.serviceCallback( auth.process( 'google', 'signup' ) ) ]
  },

  sessions = require( '@openagenda/sessions' );

module.exports = function( path ) {

  const router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
    cmn.loadBaseData( auth.layoutData, 'oa.css' ),
    sessions.middleware.ifLogged( cmn.redirectTo() )
  ] );

  return {
    load: load( router, path ),
    paths: modLib.getPaths( path, routes )
  }

}

function load( router, path ) {

  const id = _.get( config, 'auth.google.id' );

  const googleOptions = {
    clientID: id,
    clientSecret: _.get( config, 'auth.google.secret' ),
    passReqToCallback: true
  };

  return function( app ) {

    if ( id ) {

      pLib.loadStrategy( 'google', 'passport-google-oauth', 'OAuth2Strategy' );
    
      pLib.use( 'google-signin', 'google', _.extend( {
        callbackURL: genUrl.abs( 'googleSigninCallback' )
      }, googleOptions ), _loadGoogleProfile );

      pLib.use( 'google-signup', 'google', _.extend( {
        callbackURL: genUrl.abs( 'googleSignupCallback' )
      }, googleOptions ), _loadGoogleProfile );

    }

    return router.load( path )( app );

  }

}





/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'google-signin', {
    scope: 'email', 
    callbackURL: genUrl.abs( 'googleSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'google-signup', {
    scope: 'email', 
    callbackURL: genUrl.abs( 'googleSignupCallback' )
  } )( req, res, next );

}

function _processSignin( req, res, next ) {

  pLib.authenticate( 'google-signin', {}, function( err, profile, data ) {

    w( {
      err: err,
      profile: profile,
      req: req,
      res: res
    })

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, auth.attemptCreate ) )

    .then( auth.ifUserLoaded( false, auth.errors.existingEmail ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.signin ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.defaultMessage ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignin ) ) )

    .done( auth.done , cmn.catchError( req, res ) );

  } )( req, res, next );

}


function _processSignup( req, res, next ) {

  pLib.authenticate( 'google-signup', {}, function( err, profile, data ) {

    w( {
      req: req,
      res: res,
      err: err,
      profile: profile,
      data: data 
    } )

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