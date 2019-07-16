"use strict";

const _ = require( 'lodash' );
const sessions = require( '@openagenda/sessions' );
const cmn = require( '../lib/commons-app' );
const pLib = require( './lib/passport' );
const auth = require( './lib/auth' )( 'facebook' );
const agendaSvc = require( '../services/agenda' );
const genUrl = require( '../services/genUrl' );
const config = require( '../config' );

const facebookOptions = {
  clientID: _.get( config, 'auth.facebook.id' ),
  clientSecret: _.get( config, 'auth.facebook.secret' ),
  scope: [ 'email', 'public_profile' ],
  profileFields: ['id', 'email', 'name' ]
};

const preMw = [
  agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
  cmn.loadBaseData( auth.layoutData, 'oa.css' ),
  sessions.middleware.ifLogged( ( req, res ) => res.redirect( 302, '/' ) )
];

module.exports = app => {

  if ( _.get( config, 'auth.facebook.id' ) ) {
    pLib.loadStrategy( 'facebook', 'passport-facebook' );

    pLib.use( 'facebook-signin', 'facebook', {
      callbackURL: genUrl.abs( 'facebookSigninCallback' ),
      ...facebookOptions
    }, _loadFacebookProfile );

    pLib.use( 'facebook-signup', 'facebook', {
      callbackURL: genUrl.abs( 'facebookSignupCallback' ),
      ...facebookOptions
    }, _loadFacebookProfile );
  }

  app.get( '/facebook/signin', preMw, signin );
  app.get( '/:slug/facebook/signin', preMw, signin );
  app.get( '/facebook/signin/callback', preMw, auth.process( 'facebook', 'signin' ) );

  app.get( '/facebook/signup', preMw, signup );
  app.get( '/:slug/facebook/signup', preMw, signup );
  app.get( '/facebook/signup/callback', preMw, auth.process( 'facebook', 'signup' ) );

};


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

  const extracted = {
    id: profile.id,
    fullName: profile.name.givenName + ' ' + profile.name.familyName
  };

  if ( profile.emails && profile.emails.length > 0 ) {

    extracted.email = profile.emails[ 0 ].value;

  }

  done( null, extracted );

}
