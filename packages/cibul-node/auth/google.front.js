"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const sessions = require( '@openagenda/sessions' );
const cmn = require( '../lib/commons-app' );
const pLib = require( './lib/passport' );
const auth = require( './lib/auth' )( 'google' );
const genUrl = require( '../services/genUrl' );
const agendaSvc = require( '../services/agenda' );
const config = require( '../config' );

const googleOptions = {
  clientID: _.get( config, 'auth.google.id' ),
  clientSecret: _.get( config, 'auth.google.secret' ),
  passReqToCallback: true
};

const preMw = [
  agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
  cmn.loadBaseData( auth.layoutData, 'oa.css' ),
  sessions.middleware.ifLogged( ( req, res ) => res.redirect( 302, '/' ) )
];


module.exports = app => {

  if ( _.get( config, 'auth.google.id' ) ) {
    pLib.loadStrategy( 'google', 'passport-google-oauth', 'OAuth2Strategy' );

    pLib.use( 'google-signin', 'google', {
      callbackURL: genUrl.abs( 'googleSigninCallback' ),
      ...googleOptions
    }, _loadGoogleProfile );

    pLib.use( 'google-signup', 'google', {
      callbackURL: genUrl.abs( 'googleSignupCallback' ),
      ...googleOptions
    }, _loadGoogleProfile );
  }

  app.get( '/google/signin', preMw, signin );
  app.get( '/:slug/google/signin', preMw, signin );
  app.get( '/google/signin/callback', preMw, auth.serviceCallback( auth.process( 'google', 'signin' ) ) );

  app.get( '/google/signup', preMw, signup );
  app.get( '/:slug/google/signup', preMw, signup );
  app.get( '/google/signup/callback', preMw, auth.serviceCallback( auth.process( 'google', 'signup' ) ) );

};


/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'google-signin', {
    scope: [ 'email', 'profile' ],
    callbackURL: genUrl.abs( 'googleSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'google-signup', {
    scope: [ 'email', 'profile' ],
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
