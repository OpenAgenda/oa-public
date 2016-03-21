"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

w = require( 'when' ),

deepExtend = require( 'deep-extend' ),

auth = require( './lib/auth' ),

https = require( 'https' ),

log = require( 'logger' )( 'auth/local' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

userSvc = require( '../services/user' ),

agendaSvc = require( '../services/agenda' ),

pLib = require( './lib/passport' ),

emailValidator = require( 'validators/email' )(),

routes = {

  signin: [ 'get', '/signin', [ 
    auth.checkUnloggedAndUpdateRedis, auth.renderSignin 
  ] ],

  agendaSignin: [ 'get', '/:slug/signin', [
    auth.checkUnloggedAndUpdateRedis,
    auth.renderSignin
  ] ],

  signinSubmit: [ 'post', '/signin', [ 
    cmn.requireUnlogged, 
    signinSubmit
  ] ],

  agendaSigninSubmit: [ 'post', '/:slug/signin', [
    cmn.requireUnlogged,
    signinSubmit
  ] ],

  signout: [ 'get', '/signout', [
    cmn.requireLogged(),
    signout
  ] ],
  
  signup: [ 'get', '/signup', [ 
    cmn.requireUnlogged,
    _loadCaptcha,
    _guessFullName,
    auth.renderSignup
  ] ],

  agendaSignup: [ 'get', '/:slug/signup', [
    cmn.requireUnlogged,
    _loadCaptcha,
    _guessFullName,
    auth.renderSignup
  ] ],

  signupSubmit: [ 'post', '/signup', [
    cmn.requireUnlogged,
    signupSubmit
  ] ],

  agendaSignupSubmit: [ 'post', '/:slug/signup', [
    cmn.requireUnlogged,
    signupSubmit
  ] ],

  signupComplete: [ 'get', '/signup/complete', [
    cmn.requireUnlogged,
    signupComplete
  ] ],

  agendaSignupComplete: [ 'get', '/:slug/signup/complete', [
    cmn.requireUnlogged,
    signupComplete
  ]],

  activateResend: [ 'get', '/activate/resend', [
    cmn.requireUnlogged,
    activateResend
  ] ],

  agendaActivateResend: [ 'get', '/:slug/activate/resend', [
    cmn.requireUnlogged,
    activateResend
  ]],

  activate: [ 'get', '/activate/:token', [
    cmn.requireUnlogged,
    activate
  ] ],

  agendaActivate: [ 'get', '/:slug/activate/:token', [
    cmn.requireUnlogged,
    activate
  ] ]

},

useOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
};


module.exports = function( path ) {

  var router = modLib.Router( routes );

  log( 'initing' );

  pLib.loadStrategy( 'local', 'passport-local' );

  pLib.use( 'local-signin', 'local', useOptions, _handleSigninRequest );

  router.pre( [
    cmn.https,
    cmn.flashSetter,
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),
    cmn.loadBaseData( auth.layoutData, 'oa.css' ),
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}




/**
 * controllers
 */

function signout( req, res ) {

  auth.unsetSession( req, res, function() {

    res.redirect( 302, req.genUrl( 'corpoHome' ) );

  } );

}

function signinSubmit( req, res, next ) {

  pLib.authenticate( 'local-signin', {
    badRequestMessage: 'You must type in an email and a password'
  }, function( err, user, data ) {

    w( {
      err: err,
      req: req,
      res: res,
      data: data,
      user: user
    } )

    .then( auth.ifUserLoaded( false, function( values ) {

      deepExtend( values.data, values.req.body );

      return auth.renderSignin( values );

    } ) )

    .then( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToResend ) ) )

    .then( auth.ifUserLoaded( true, auth.signin ) )

    .done( auth.done , cmn.catchError( req, res ) );

  } )( req, res, next );

}


function signupSubmit( req, res ) {

  w( { req: req, res: res, data: req.body } )

  .then( _passwordMatchCheck )

  .then( _captchaCheck )

  .then( _ifHasErrors( false, _attemptCreate ) )

  .then( auth.ifUserLoaded( true, auth.ifUserActivated( false, auth.redirectToComplete ) ) )

  .then( auth.ifUserLoaded( true, auth.ifUserActivated( true, auth.signin ) ) )

  .then( auth.ifUnresolved( _pLoadCaptcha ) )

  .then( auth.ifUnresolved( auth.renderSignup ) )

  .done( auth.done , cmn.catchError( req, res ) );

}



function signupComplete( req, res ) {

  var resendQuery = lib.extend( auth.loadOptionals( req ), { email: req.query.email } );

  if ( req.agenda ) resendQuery.slug = req.agenda.slug;

  cmn.render( req, res, 'auth/activation', { 
    agenda: req.agenda,
    resendQuery: resendQuery
  } );

}


function activateResend( req, res ) {

  if ( !req.query.email ) {

    auth.renderEmail( { req: req, res: res, title: 'Resend activation mail' });

  } else {

    userSvc.activation.createAndSend( lib.extend( auth.loadOptionals( req ), { 
      email: req.query.email,
      agenda: req.agenda
    } ) )

    .then( function( values ) {

      res.setFlash( req, 'The activation email is being sent again' );

      return lib.extend( values, { req: req, res: res } );

    })

    .then( auth.redirectToComplete )

    .done( auth.done, function( error ) {

      if ( error == 'no account was found' ) error = 'no account matches this email';

      auth.renderEmail( {
        req: req,
        res: res,
        data: {
          errors: { email: error },
          email: req.query.email
        }
      });

    });

  }

}


function activate( req, res ) {

  userSvc.activation.activateByToken( req.params.token, auth.loadOptionals( req ), function( err, user ) {

    if ( err ) {

      return cmn.catchError( req, res )( err );

    }

    if ( !user ) {

      return auth.renderInvalidActivation( req, res );

    }

    auth.signin( { req: req, res: res, user: user } );

  });

}


function _handleSigninRequest( req, email, password, done ) {

  userSvc.auth( email, password, done );

}





function _ifHasErrors( has, func ) {

  return function( values ) {

    if ( !!values.data.errors !== has ) return values;

    return func( values );

  }

}


function _pLoadCaptcha( v ) {

  return w.promise( function( rs, rj ) {

    _loadCaptcha( v.req, v.res, function() {

      rs( v );

    });

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


function _guessFullName( req, res, next ) {

  if ( !req.query.email ) return next();

  let email;

  try {

    email = emailValidator( req.query.email );

  } catch( e ) {

    return next();

  }
  
  let parts = email.split( '@' ),

  name = parts[ 0 ]

  .split( /[\._]/g )

  .map( s => s[ 0 ].toUpperCase() + s.substr( 1 ) )

  .join( ' ' ),

  at = ( parts[ 1 ][ 0 ].toUpperCase() + parts[ 1 ].substr( 1 ) ).split( '.' )[ 0 ];

  auth.renderSignup( req, res, {
    full_name: name + ' ' + at
  } );

}


function _attemptCreate( values ) {

  return w.promise( function( resolve, reject ) {

    var options = auth.loadOptionals( values.req );

    if ( values.req.agenda ) options.agenda = values.req.agenda;

    userSvc.create( {
      fullName: values.req.body.full_name,
      email: values.req.body.email,
      password: values.req.body.password,
      culture: values.req.lang
    }, options, function( err, user, data ) {

      if ( err ) return reject( err );

      if ( user ) values.user = user;

      if ( data.errors ) {

        deepExtend( values.data, data );

      }

      resolve( values );

    } );

  });

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

  return w.promise( function( resolve, reject ) {

    var verifyUrl = config.auth.local.captchaVerify + '?'
    + 'secret=' + config.auth.local.captchaSecret
    + '&response=' + values.req.body[ 'g-recaptcha-response' ]
    + '&remoteip=' + values.req.header( 'x-forwarded-for' );

    _getAndParse( verifyUrl, function( err, data ) {

      if ( err || !data.success ) {

        values.data.errors = {
          captcha: 'Try this again'
        };
        
      }

      resolve( values );

    } );

  });


}

function _getAndParse( url, cb ) {

  var data = '';

  log( 'fetching %s', url );

  https.get( url, function( res ) {

    if ( res.statusCode !== 200 ) {

      // log error and fa'ggetabatit

      log( 'error', 'received a status code %s from %s', res.statusCode, url );

      return cb( true );

    }

    res.on( 'data', function( chunk ) {

      data += chunk;

    });

    res.on( 'end', function() {

      try {

        data = JSON.parse( data );

      } catch( e ) {

        log( 'error', 'invalid JSON received' );

        return cb( e );

      }

      cb( null, data );

    });

  } );

}