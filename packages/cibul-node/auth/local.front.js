"use strict";

var appName = 'auth/local',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

w = require( 'when' ),

deepExtend = require( 'deep-extend' ),

auth = require( './lib/auth' ),

https = require( 'https' ),

routes = {
  signin: [ 'get', auth.renderSignin, '/signin', [ cmn.requireUnlogged ] ],
  signinSubmit: [ 'post', signinSubmit, '/signin', [ cmn.requireUnlogged ] ],
  signout: [ 'get', signout, '/signout', [ cmn.requireLogged ] ],
  signup: [ 'get', auth.renderSignup, '/signup', [ cmn.requireUnlogged, _loadCaptcha ] ],
  signupSubmit: [ 'post', signupSubmit, '/signup', [ cmn.requireUnlogged ] ],
  signupComplete: [ 'get', signupComplete, '/signup/complete', [ cmn.requireUnlogged ] ],
  activateResend: [ 'get', activateResend, '/activate/resend', [ cmn.requireUnlogged ] ],
  activate: [ 'get', activate, '/activate/:token', [ cmn.requireUnlogged ] ]
},

useOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},

log = require( '../lib/logger' )( appName ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

app,

path,

userSvc = require( '../services/user/user' ),

pLib = require( './lib/passport' );

function init( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes );

  pLib.loadStrategy( 'local', 'passport-local' );

  pLib.use( 'local-signin', 'local', useOptions, _handleSigninRequest );

  return exposed;

}

function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded' );

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.use( cmn.urlGenSetter( appName, path ) );

  cmn.loadRoutes( app, routes, [
    cmn.https,
    cmn.flashSetter,
    cmn.loadBaseData( auth.layoutData ),
    cmn.loadSession
  ] );

  return exposed;

}


/**
 * controllers
 */

function signout( req, res ) {

  auth.unsetSession( req, res, function() {

    cmn.redirect( req, res, 'presentation' );

  } );

}

function signinSubmit( req, res, next ) {

  pLib.authenticate( 'local-signin', {
    badRequestMessage: 'You must type in an email and a password'
  }, function( err, user, data ) {

    w( { err: err, req: req, res: res, data: data, user: user } )

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

  .then( auth.ifUnresolved( auth.renderSignup ) )

  .done( auth.done , cmn.catchError( req, res ) );

}



function signupComplete( req, res ) {

  var resendQuery = lib.extend( auth.loadOptionals( req ), { email: req.query.email } )

  cmn.render( req, res, 'auth/activation', { resendQuery: resendQuery } );

}


function activateResend( req, res ) {

  if ( !req.query.email ) {

    auth.renderEmail( { req: req, res: res, title: 'Resend activation mail' });

  } else {

    userSvc.activation.createAndSend( lib.extend( auth.loadOptionals( req ), { email: req.query.email } ) )

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

      return cmn.catchError( req, res )( 'Activation link was not recognized. Please try again.' );

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


function _attemptCreate( values ) {

  return w.promise( function( resolve, reject ) {

    userSvc.create( {
      fullName: values.req.body.full_name,
      email: values.req.body.email,
      password: values.req.body.password,
      culture: values.req.lang
    }, auth.loadOptionals( values.req ), function( err, user, data ) {

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

module.exports = init;