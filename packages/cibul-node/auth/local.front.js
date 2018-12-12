"use strict";

const bodyMw = require( 'body-parser' ).urlencoded( {
  extended: true,
  limit: 500000
} );

const https = require( 'https' );
const _ = require( 'lodash' );
const w = require( 'when' );
const usersSvc = require( '@openagenda/users' );
const sessions = require( '@openagenda/sessions' );
const invitationsSvc = require( '@openagenda/invitations' );
const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/auth/signin' ) );
const log = require( '@openagenda/logs' )( 'auth/local' );
const __ = require( '@openagenda/labels' )( require( '@openagenda/labels/auth/activation' ) );
const agendaSvc = require( '../services/agenda' );
const modLib = require( '../lib/moduleLib' );
const cmn = require( '../lib/commons-app' );
const lib = require( '../lib/lib' );
const auth = require( './lib/auth' );
const pLib = require( './lib/passport' );
const config = require( '../config' );

const routes = {

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

};

const useOptions = {
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

        _.merge( v.data, v.req.body );

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

    .then( async values => {

      if ( values.data.errors ) {
        return values;
      }

      const optionals = _.pickBy( _.pick( req.query, 'iToken', 'invitation', 'redirect', 'agenda' ) );

      if ( req.agenda ) {
        optionals.agenda = req.agenda;
      }

      try {
        const user = await usersSvc.create( {
          fullName: req.body.full_name,
          email: req.body.email,
          password: req.body.password,
          culture: req.lang
        }, {
          detailed: true,
          tokenOptionals: optionals,
          optionals
        } );

        if ( user ) {
          values.user = user;
        }
      } catch ( err ) {
        if ( err && err.message === 'Already exist' ) {
          values.data.errors = { email: 'usedEmail' };
        }

        if ( _.isObject( err.errors ) && Object.keys( err.errors ) > 0 ) {
          values.data.errors = err.errors;
        }
      }

      return values;

    } )

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


async function activateResend( req, res ) {

  if ( !req.query.email ) {
    auth.renderEmail( { req, res, title: 'Resend activation mail' } );
  } else {
    let user;
    let token;

    const optionals = _.pickBy( _.pick( req.query, 'iToken', 'invitation', 'redirect', 'agenda' ) );

    try {
      user = await usersSvc.findOne( {
        query: { email: req.query.email },
        detailed: true
      } );

      if ( !user ) {
        throw 'no account matches this email';
      }

      if ( user && user.isActivated ) {
        throw 'the account is already activated';
      }

      token = await usersSvc.tokens.findOne( {
        query: { userId: user.id, email: user.email, type: 'aa' },
      } );

      if ( token ) {
        await usersSvc.config.interfaces.sendToken()( { result: token, params: { user, optionals } } );
      } else {
        token = await await usersSvc.tokens.create(
          { userId: user.id, email: user.email, type: 'aa' },
          { user, optionals }
        );
      }

      sessions.setFlash( req, res, __( 'sendAgain', req.lang ) );

      auth.redirectToComplete( {
        ...optionals,
        req,
        res,
        user,
        token: token.token
      } );
    } catch ( error ) {
      log( 'error', error );

      auth.renderEmail( {
        req,
        res,
        data: {
          errors: { email: error ? (error.message || error) : error },
          email: req.query.email
        }
      } );
    }

  }

}


async function activate( req, res ) {

  const optionals = _.pickBy( _.pick( req.query, 'iToken', 'invitation', 'redirect', 'agenda' ) );

  try {

    const user = await usersSvc.activate( 0, { token: req.params.token }, { optionals } );

    if ( !req.query || !req.query.invitation ) {

      return auth.signin( { req, res, user } );

    }

    invitationsSvc.get( { token: req.query.invitation }, { includeProcessed: true }, ( err, { invitation } ) => {

      if ( err || !invitation ) return auth.signin( { req, res, user } );

      const actions = invitation.data.actions.filter( v => v.name === 'linkStakeholder' );

      if ( actions.length === 1 ) {

        const agendaId = actions[ 0 ].params[ 0 ].agendaId;

        return agendaSvc.get( { id: agendaId }, ( err, agenda ) => {

          if ( err ) {

            req.log( 'error', err );

          } else {

            req.agenda = agenda;

          }

          auth.signin( { req, res, user } );

        } );

      }

      return auth.signin( { req, res, user } );

    } );

  } catch ( err ) {

    if ( err.message.includes( 'not found' ) ) {
      return auth.renderInvalidActivation( req, res );
    }

    return cmn.catchError( req, res )( err );

  }

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

    _.merge( req.baseData, {
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
