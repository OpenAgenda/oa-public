"use strict";

const _ = require( 'lodash' );

const modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  config = require( '../config' ),

  lib = require( '../lib/lib' ),

  pLib = require( './lib/passport' ),

  auth = require( './lib/auth' )( 'facebook' ),

  genUrl = require( '../services/genUrl' ),

  agendaSvc = require( '../services/agenda' ),

  routes = {
    facebookSignin: [ 'get', '/facebook/signin', signin ],
    agendaFacebookSignin: [ 'get', '/:slug/facebook/signin', signin ],
    facebookSigninCallback: [ 'get', '/facebook/signin/callback', auth.process( 'facebook', 'signin' ) ],
    facebookSignup: [ 'get', '/facebook/signup', signup ],
    agendaFacebookSignup: [ 'get', '/:slug/facebook/signup', signup ],
    facebookSignupCallback: [ 'get', '/facebook/signup/callback', auth.process( 'facebook', 'signup' ) ]
  },

  sessions = require( '@openagenda/sessions' );

module.exports = function( path ) {

  const router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
    cmn.loadBaseData( auth.layoutData, 'oa.css' ),
    sessions.middleware.ifLogged( ( req, res ) => res.redirect( 302, '/' ) )
  ] );

  return {
    load: load( router, path ),
    paths: modLib.getPaths( path, routes )
  }

}


function load( router, path ) {

  const facebookOptions = {
    clientID: _.get( config, 'auth.facebook.id' ),
    clientSecret: _.get( config, 'auth.facebook.secret' ),
    scope: [ 'email', 'public_profile' ],
    profileFields: ['id', 'email', 'name' ]
  };

  return function( app ) {

    if ( _.get( config, 'auth.facebook.id' ) ) {

      pLib.loadStrategy( 'facebook', 'passport-facebook' );

      pLib.use( 'facebook-signin', 'facebook', lib.extend( {
        callbackURL: genUrl.abs( 'facebookSigninCallback' )
      }, facebookOptions ), _loadFacebookProfile );

      pLib.use( 'facebook-signup', 'facebook', lib.extend( {
        callbackURL: genUrl.abs( 'facebookSignupCallback' )
      }, facebookOptions ), _loadFacebookProfile );

    }

    return router.load( path )( app );

  }

}


/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'facebook-signin' )( req, res, next );

}


function signup( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'facebook-signup' )( req, res, next );

}


function _loadFacebookProfile( accessToken, refreshToken, profile, done ) {

  var extracted = {
    id: profile.id,
    fullName: profile.name.givenName + ' ' + profile.name.familyName
  };

  if ( profile.emails && profile.emails.length > 0 ) {

    extracted.email = profile.emails[ 0 ].value;

  }

  done( null, extracted );

}
