"use strict";

const bodyMw = require( 'body-parser' ).urlencoded( {
  extended: true,
  limit: 500000
} );

const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/auth/signin' ) );

const modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  w = require( 'when' ),

  deepExtend = require( 'deep-extend' ),

  auth = require( './lib/auth' ),

  https = require( 'https' ),

  log = require( '@openagenda/logger' )( 'auth/local' ),

  config = require( '../config' ),

  lib = require( '../lib/lib' ),

  legacyUserSvc = require( '../services/user' ),

  usersSvc = require( '@openagenda/users' ),

  __ = require( '@openagenda/labels' )( require( '@openagenda/labels/auth/activation' ) ),

  agendaSvc = require( '../services/agenda' ),

  pLib = require( './lib/passport' ),

  sessions = require( '@openagenda/sessions' ),

  invitationsSvc = require( '@openagenda/invitations' ),

  routes = {

    signin: [ 'get', '/signin', [
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      _presetEmail,
      auth.renderSignin
    ] ],

    agendaSignin: [ 'get', '/:slug/signin', [
      sessions.middleware.ifLogged( cmn.redirectTo( 'agendaEventNew', { slug: 'slug' } ) ),
      _presetEmail,
      auth.renderSignin
    ] ],

    signinSubmit: [ 'post', '/signin', [
      ( req, res, next ) => {

        req.log( 'info', 'signing in user %s', req.body.email );

        next();

      },
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      signinSubmit
    ] ],

    agendaSigninSubmit: [ 'post', '/:slug/signin', [
      sessions.middleware.ifLogged( cmn.redirectTo( 'agendaEventNew', { slug: 'slug' } ) ),
      signinSubmit
    ] ],

    signup: [ 'get', '/signup', [
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      _loadCaptcha,
      _guessFullName,
      auth.renderSignup
    ] ],

    agendaSignup: [ 'get', '/:slug/signup', [
      sessions.middleware.ifLogged( cmn.redirectTo( 'agendaEventNew', { slug: 'slug' } ) ),
      _loadCaptcha,
      _guessFullName,
      auth.renderSignup
    ] ],

    signupSubmit: [ 'post', '/signup', [
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      signupSubmit
    ] ],

    agendaSignupSubmit: [ 'post', '/:slug/signup', [
      sessions.middleware.ifLogged( cmn.redirectTo( 'agendaEventNew', { slug: 'slug' } ) ),
      signupSubmit
    ] ],

    signupComplete: [ 'get', '/signup/complete', [
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      signupComplete
    ] ],

    agendaSignupComplete: [ 'get', '/:slug/signup/complete', [
      sessions.middleware.ifLogged( cmn.redirectTo( 'agendaEventNew', { slug: 'slug' } ) ),
      signupComplete
    ] ],

    activateResend: [ 'get', '/activate/resend', [
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      activateResend
    ] ],

    agendaActivateResend: [ 'get', '/:slug/activate/resend', [
      sessions.middleware.ifLogged( cmn.redirectTo( 'agendaEventNew', { slug: 'slug' } ) ),
      activateResend
    ] ],

    activate: [ 'get', '/activate/:token', [
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      activate
    ] ],

    agendaActivate: [ 'get', '/:slug/activate/:token', [
      sessions.middleware.ifLogged( cmn.redirectTo( 'agendaEventNew', { slug: 'slug' } ) ),
      activate
    ] ]

  },

  useOptions = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  };


module.exports = function ( path ) {

  const router = modLib.Router( routes );

  log( 'initing' );

  pLib.loadStrategy( 'local', 'passport-local' );

  pLib.use( 'local-signin', 'local', useOptions, _handleSigninRequest );

  router.pre( [
    cmn.https,
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
    cmn.loadBaseData( auth.layoutData, 'oasfmain.css' ),
    bodyMw
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function signinSubmit( req, res, next ) {

  pLib.authenticate( 'local-signin', {
    badRequestMessage: getLabel( 'incorrectPassword', req.lang )
  }, function ( err, user, data ) {

    if ( err ) {

      req.log( 'error', 'passport could not complete signing and received error %s', JSON.stringify( err ) );

    }

    w( { err, req, res, data, user } )

      .then( auth.ifUserLoaded( false, v => {

        if ( v.err && v.err.name !== 'NotFound' ) {

          v.req.log( 'error', 'user could not be loaded with data %s', JSON.stringify( v.data ) );

        }

        deepExtend( v.data, v.req.body );

        return auth.renderSignin( v );

      } ) )

      .then( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToResend ) ) )

      .then( auth.ifUserLoaded( true, auth.signin ) )

      .done( auth.done, cmn.catchError( req, res ) );

  } )( req, res, next );

}


function signupSubmit( req, res ) {

  w( { req, res, data: req.body } )

    .then( _passwordMatchCheck )

    .then( _captchaCheck )

    .then( _ifHasErrors( false, _attemptCreate ) )

    .then( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToComplete ) ) )

    .then( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) )

    .then( auth.ifUnresolved( _pLoadCaptcha ) )

    .then( auth.ifUnresolved( auth.renderSignup ) )

    .done( auth.done, cmn.catchError( req, res ) );

}


function signupComplete( req, res ) {

  const resendQuery = lib.extend( auth.loadOptionals( req ), { email: req.query.email } );

  if ( req.agenda ) resendQuery.slug = req.agenda.slug;

  cmn.render( req, res, 'auth/activation', {
    agenda: req.agenda,
    resendQuery
  } );

}


function activateResend( req, res ) {

  if ( !req.query.email ) {

    auth.renderEmail( { req, res, title: 'Resend activation mail' } );

  } else {

    legacyUserSvc.activation.createAndSend( lib.extend( auth.loadOptionals( req ), {
      email: req.query.email,
      agenda: req.agenda
    } ) )

      .then( function ( values ) {

        sessions.setFlash( req, res, __( 'sendAgain', req.lang ) );

        return lib.extend( values, { req, res } );

      } )

      .then( auth.redirectToComplete )

      .done( auth.done, function ( error ) {

        if ( error == 'no account was found' ) error = 'no account matches this email';

        auth.renderEmail( {
          req,
          res,
          data: {
            errors: { email: error },
            email: req.query.email
          }
        } );

      } );

  }

}


function activate( req, res ) {

  legacyUserSvc.activation.activateByToken( req.params.token, auth.loadOptionals( req ), function ( err, user ) {

    if ( err ) {

      return cmn.catchError( req, res )( err );

    }

    if ( !user ) {

      return auth.renderInvalidActivation( req, res );

    }

    if ( !req.query || !req.query.invitation ) {

      return auth.signin( { req, res, user } );

    }

    invitationsSvc.get( { token: req.query.invitation }, { includeProcessed: true }, ( err, { invitation } ) => {

      if ( err || !invitation ) return auth.signin( { req, res, user } );

      const actions = invitation.data.actions.filter( v => v.name === 'linkStakeholder' );

      if ( actions.length === 1 ) {

        const agendaId = actions[ 0 ].params[ 0 ].agendaId;

        return agendaSvc.get( { id: agendaId }, ( err, agenda ) => {

          if ( err ) {

            req.log( 'error', err );

          } else {

            req.agenda = agenda;

          }

          auth.signin( { req, res, user } );

        } );

      }

      return auth.signin( { req, res, user } );

    } );

  } );

}


function _handleSigninRequest( req, email, password, cb ) {

  usersSvc.verifyPassword( password, {
    query: { email }
  } )
    .then( async validPassword => {
      if ( !validPassword ) {
        return cb( null, null, {
          email,
          password,
          user: null,
          errors: {
            password: 'This password is incorrect'
          }
        } );
      }

      const user = await usersSvc.findOne( { query: { email }, detailed: true } );

      cb( null, user, { email, password, user } );
    } )
    .catch( cb );

}


function _ifHasErrors( has, func ) {

  return function ( values ) {

    if ( !!values.data.errors !== has ) return values;

    return func( values );

  }

}


function _pLoadCaptcha( v ) {

  return w.promise( function ( rs, rj ) {

    _loadCaptcha( v.req, v.res, function () {

      rs( v );

    } );

  } );

}


function _loadCaptcha( req, res, next ) {

  if ( config.auth.local.useCaptcha ) {

    if ( !req.baseData ) req.baseData = {};

    deepExtend( req.baseData, {
      head: {
        js: {
          captcha: {
            src: "https://www.google.com/recaptcha/api.js?hl=" + req.lang,
            async: true,
            defer: true
          }
        },
      },
      useCaptcha: true,
      captchaKey: config.auth.local.captchaKey
    } );

  }

  next();

}

function _presetEmail( req, res, next ) {

  if ( !req.query.email ) return next();

  auth.renderSignin( req, res, {
    email: req.query.email
  } );

}


function _guessFullName( req, res, next ) {

  if ( !req.query.email ) return next();

  const fullName = auth.fullNameFromEmail( req.query.email );

  if ( !fullName ) return next();

  auth.renderSignup( req, res, {
    full_name: fullName,
    email: req.query.email
  } );

}


function _attemptCreate( values ) {

  return w.promise( function ( resolve, reject ) {

    const options = auth.loadOptionals( values.req );

    if ( values.req.agenda ) options.agenda = values.req.agenda;

    legacyUserSvc.create( {
      fullName: values.req.body.full_name,
      email: values.req.body.email,
      password: values.req.body.password,
      culture: values.req.lang
    }, options, function ( err, user, data ) {

      if ( err ) return reject( err );

      if ( user ) values.user = user;

      if ( data.errors ) {

        deepExtend( values.data, data );

      }

      resolve( values );

    } );

  } );

}


function _passwordMatchCheck( values ) {

  if ( values.req.body.password !== values.req.body.repeat ) {

    if ( !values.data.errors ) values.data.errors = {};

    values.data.errors.repeat = 'The two passwords must be the same';

  }

  return values;

}

function _captchaCheck( values ) {

  if ( !config.auth.local.useCaptcha ) return values;

  return w.promise( function ( resolve, reject ) {

    const verifyUrl = config.auth.local.captchaVerify + '?'
      + 'secret=' + config.auth.local.captchaSecret
      + '&response=' + values.req.body[ 'g-recaptcha-response' ]
      + '&remoteip=' + values.req.header( 'x-forwarded-for' );

    _getAndParse( verifyUrl, function ( err, data ) {

      if ( err || !data.success ) {

        values.data.errors = {
          captcha: 'captchaTryAgain'
        };

      }

      resolve( values );

    } );

  } );


}

function _getAndParse( url, cb ) {

  let data = '';

  log( 'fetching %s', url );

  https.get( url, function ( res ) {

    if ( res.statusCode !== 200 ) {

      // log error and fa'ggetabatit

      log( 'error', 'received a status code %s from %s', res.statusCode, url );

      return cb( true );

    }

    res.on( 'data', function ( chunk ) {

      data += chunk;

    } );

    res.on( 'end', function () {

      try {

        data = JSON.parse( data );

      } catch ( e ) {

        log( 'error', 'invalid JSON received' );

        return cb( e );

      }

      cb( null, data );

    } );

  } );

}