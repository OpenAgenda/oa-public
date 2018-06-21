"use strict";

const _ = require( 'lodash' );

const modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

userSvc = require( '../services/user' ),

pLib = require( './lib/passport' ),

auth = require( './lib/auth' )( 'twitter' ),

sessions = require( '@openagenda/sessions' ),

deepExtend = require( 'deep-extend' ),

genUrl = require( '../services/genUrl' ),

agendaSvc = require( '../services/agenda' ),

w = require( 'when' ),

routes = {
  twitterSignin: [ 'get', '/twitter/signin', signin ],
  agendaTwitterSignin: [ 'get', '/:slug/twitter/signin', signin ],
  twitterSigninCallback: [ 'get', '/twitter/signin/callback', auth.serviceCallback( _processSignin ) ],
  twitterSignup: [ 'get', '/twitter/signup', signup ],
  agendaTwitterSignup: [ 'get', '/:slug/twitter/signup', signup ],
  twitterEmail: [ 'get', '/twitter/email', email ],
  agendaTwitterEmail: [ 'get', '/:slug/twitter/email', email ],
  twitterSignupCallback: [ 'get', '/twitter/signup/callback', auth.serviceCallback( _processSignup ) ]
};


module.exports = function( path ) {

  const router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
    cmn.loadBaseData( auth.layoutData, 'oa.css' ),
    sessions.middleware.ifLogged( cmn.redirectTo() ),
  ] );

  return {
    load: load( router, path ),
    paths: modLib.getPaths( path, routes )
  }

}


function load( router, path ) {

  const key = _.get( config, 'auth.twitter.key' );
  const secret = _.get( config, 'auth.twitter.secret' );

  const twitterOptions = {
    consumerKey: key,
    consumerSecret: secret,
    passReqToCallback: true,
    skipExtendedUserProfile: true
  };

  return function( app ) {

    if ( key ) {

      pLib.loadStrategy( 'twitter', 'passport-twitter' );

      pLib.use( 'twitter-signin', 'twitter', lib.extend( {
        callbackURL: genUrl.abs( 'twitterSigninCallback' )
      }, twitterOptions ), _loadTwitterProfile );

      pLib.use( 'twitter-signup', 'twitter', lib.extend({
        callbackURL: genUrl.abs( 'twitterSignupCallback' )
      }, twitterOptions ), _loadTwitterProfile );

    }

    return router.load( path )( app );

  }

}


/**
 * controllers
 */

function signin( req, res, next ) {

  auth.saveOptionals( req, res, req.agenda ? { agenda: req.agenda.slug } : {} );

  pLib.authenticate( 'twitter-signin', {
    callbackURL: genUrl.abs( 'twitterSigninCallback' )
  } )( req, res, next );

}

function signup( req, res, next ) {

  const additional = {};

  if ( req.query.email ) {

    req.log( 'retrieved email %s', req.query.email );

    additional.email = req.query.email;

  }

  if ( req.agenda ) {

    additional.agenda = req.agenda.slug;

  }

  auth.saveOptionals( req, res, additional );

  pLib.authenticate( 'twitter-signup', {
    callbackURL: genUrl.abs( 'twitterSignupCallback' )
  })( req, res, next );

}


function email( req, res, next ) {

  auth.renderEmail( req, res, {
    optionals: auth.loadOptionals( req ),
    uri: req.agenda ? 'agendaTwitterSignup' : 'twitterSignup'
  } );

}


function _processSignin( req, res, next ) {

  req.log( 'processing signin%s', req.agenda ? ' with agenda ' + req.agenda.slug : '' );

  pLib.authenticate( 'twitter-signin', {}, function( err, profile, data ) {

    w( { err, profile, req, res } )

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, _attemptUsernameLoad ) )

    .then( auth.ifUserLoaded( true, auth.ifUserActivated( false, _resendActivationToken ) ) )

    .then( auth.ifUserLoaded( false, _attemptTwitterCreate ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.defaultMessage ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( function( values ) {

      req.log( 'signinCallback controller complete' );

    }, cmn.catchError( req, res ) );

  } )(req, res, next );

}


function _processSignup( req, res, next ) {

  req.log( 'processing signup%s', req.agenda ? ' with agenda ' + req.agenda.slug : '' );

  pLib.authenticate( 'twitter-signup', {}, function( err, profile, data ) {

    w( { req: req, res: res, err: err, profile: profile, data: data } )

    .then( auth.attemptAuth )

    .then( auth.ifUserLoaded( false, _attemptTwitterCreate ) )

    // .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( false, _resendActivationToken ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) ) )

    .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.renderSignup ) ) )

    .done( auth.done , cmn.catchError( req, res ) );

  })( req, res, next );

}


function _resendActivationToken( values ) {

  values.req.log( 'resend activation token' )

  if ( values.req.agenda ) values.agenda = values.req.agenda;

  return w( values )

  .then( userSvc.activation.createAndSend )

  .then( auth.redirectToComplete );

}


function _attemptTwitterCreate( values ) {

  values.req.log( 'attempting twitter create' );

  return w( values )

  .then( _redirectEmailFormIfNoProfileEmail )

  .then( auth.ifUnresolved( auth.attemptCreate ) )

  .then( auth.ifUnresolved( auth.ifUserLoaded( false, auth.errors.existingEmail ) ) );

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

    if ( !values.profile ) {

      return reject( values );

    }

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


function _redirectEmailFormIfNoProfileEmail( values ) {

  values.req.log( 'redirect if no email is found in query' );

  var redirectUrl = values.req.genUrl( values.req.agenda ? 'agendaTwitterEmail' : 'twitterEmail', [ 
    values.req.query, values.req.agenda ? { slug: values.req.agenda.slug } : {} 
  ] );

  if ( !values.req.query.email ) {

    values.req.log( 'no email is set in query' );

    values.res.redirect( 302, redirectUrl );

    values.resolved = true;

  }

  return values;

}