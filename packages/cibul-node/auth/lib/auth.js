"use strict";

var cmn = require( '../../lib/commons-app' ),

lib = require( '../../lib/lib' ),

config = require( '../../config' ),

w = require( 'when' ),

deepExtend = require( 'deep-extend' ),

userSvc = require( '../../services/user/user' ),

session = require( './session' ),

exposed = {
  setSession: session.set,
  unsetSession: session.unset,
  signin: signin,
  layoutData: layoutData,
  ifUserLoaded: ifUserLoaded,
  ifUserActivated: ifUserActivated,
  ifUnresolved: ifUnresolved,
  redirectToComplete: redirectToComplete,
  redirectToResend: redirectToResend,
  loadOptionals: loadOptionals,
  saveOptionals: saveOptionals,
  restoreOptionals: restoreOptionals,
  done: done, // when a controller is done
  errors: {
    defaultMessage: errorDefaultMessage,
    existingEmail: errorExistingEmail
  }
};

exposed.renderSignin = _render( 'auth/signin', {
  optionals: {},
  email: '',
  password: '',
  errors: {}
});

exposed.renderSignup = _render( 'auth/signup', {
  optionals: {},
  full_name: '',
  email: '',
  password: '',
  repeat: '',
  message: '',
  errors: {}
});

exposed.renderEmail = _render( 'auth/emailForm', {
  optionals: {},
  email: '',
  errors: {}
});

function init( service ) {
  
  return deepExtend( {
    attemptAuth: attemptAuth,
    attemptCreate: attemptCreate,
    errors: {}
  }, exposed );


  function attemptAuth( values ) {

    values.req.log( 'attempting authentication for %s with %s', service, JSON.stringify( values.profile ) );

    if ( values.resolved ) {

      values.req.log( 'already resolved, returning values' );

      return values;

    }

    return w.promise( function( resolve, reject ) {

      var options = {};

      if ( !values.profile ) {

        return resolve( values );

      }

      userSvc.auth[ service ]( values.profile.id, loadOptionals( values.req ), function( err, user, data ) {

        if ( err ) values.err = err;

        if ( user ) {

          values.user = user;

        }

        if ( data ) deepExtend( values.data, data );

        resolve( values );

      });

    });

  }


  /**
   * try to create an account with profile info
   */

  function attemptCreate( values ) {

    values.req.log( '%s attempting account creation with %s', service, JSON.stringify( values.profile ) );

    return w.promise( function( resolve, reject ) {

      var options = {};

      if ( !values.profile ) {

        return resolve( values );

      }

      userSvc.create[ service ]( {
        id: values.profile.id,
        email: values.profile.email,
        fullName: values.profile.fullName,
        culture: values.req.lang
      }, loadOptionals( values.req ), function( err, user, data ) {

        if ( err ) values.err = err;

        if ( user ) {

          values.user = user;

        } else {

          values.req.log( 'no account was created' );

        }

        if ( data ) {

          values.data = deepExtend( values.data ? values.data : {}, data );

        }

        values.req.log( 'creation attempt completed with user %s and data %s', JSON.stringify( values.user ), JSON.stringify( values.data ) );

        resolve( values );

      } );

    } );

  }

}

module.exports = init;

lib.extend( init, exposed );


function signin( values ) {

  var req = values.req, res = values.res, user = values.user;

  if ( values.resolved ) return values;

  values.resolved = true;

  values.req.log( 'signing in user %s', user.email );

  return w.promise( function( resolve, reject ) {

    session.set( req, res, user, function() {

      var redirectUrl;

      if ( req.query.redirect ) {

        try {

          redirectUrl = new Buffer(req.query.redirect, 'base64').toString();

        } catch ( e ) {

          req.log( 'error', 'could not decode redirect %s', req.query.redirect );

        }

        if ( redirectUrl ) {

          req.log( 'info', 'signin in successful, redirecting to %s', redirectUrl );

          res.redirect( redirectUrl );

          resolve( values );

          return;

        }

      }

      res.redirect( 302, req.genUrl( 'homeShow' ) );

      resolve( values );

    } );

  } );

}


function _render( template, defaults ) {

  return function( values ) {

    var asPromise = arguments.length===1,

    req = asPromise ? values.req : arguments[ 0 ], 

    res = asPromise ? values.res : arguments[ 1 ],

    data = deepExtend( {}, defaults );

    if ( asPromise ) {

      values.resolved = true;

      if ( values.err ) deepExtend( data, values.err );

      data = deepExtend( data, values.data ? values.data : {} );

    }

    cmn.render( req, res, template, data );

    return values;

  }

}

function ifUnresolved( cb ) {

  return function( values ) {

    if ( !values.resolved ) {

      return cb( values );

    } else {

      return w( values );

    }

  }

}

function ifUserActivated( expected, cb ) {

  return function( values ) {

    if ( !!values.user.isActivated == expected ) {

      return cb( values );

    } else {

      return w( values );

    }

  }

} 

function ifUserLoaded( loaded, cb ) {

  return function( values ) {

    if ( !!values.user == loaded ) {

      return cb( values );

    } else {

      return w( values );

    }

  }

} 

function errorDefaultMessage( values ) {

  if ( values.resolved ) return values;

  values.req.log( 'loading default error message' );

  if ( !values.err ) values.err = {};

  if ( !values.err.message ) {

    values.err.message = 'There was a problem. Please try again later';

  }

  return values;

}


function errorExistingEmail( values ) {

  if ( values.resolved ) return values;

  values.req.log( 'checking if account with same email exists' );

  if ( values.data && values.data.errors && values.data.errors.email ) {

    values.req.log( 'an account exists with email: %s', JSON.stringify( values.profile ) );

    delete values.data.errors.email;

    values.data.message = 'An account with your email already exists. Please sign in using your email and password';

    return exposed.renderSignin( values );

  }

  return values;

}


function redirectToResend( values ) {

  values.resend = true;

  return redirectToComplete( values );

}


function redirectToComplete( values ) {

  var uri = values.resend? 'activateResend' : 'signupComplete';

  values.res.redirect( 302, values.req.genUrl( uri, lib.extend( loadOptionals( values.req ), { email: values.user.email } ) ) );

  values.resolved = true;

  return values;

}


function layoutData( req ) {

  return {
    optionals: loadOptionals( req )
  }

}

function loadOptionals( req ) {

  var optionals = {};

  if ( req.query.iToken ) {

    optionals.iToken = req.query.iToken;

  }

  if ( req.query.redirect ) {

    optionals.redirect = req.query.redirect;

  }

  return optionals;

}

function done( values ) {

  values.req.log( 'done' );

} 

function saveOptionals( req, res, additionals ) {

  var toStore = lib.extend( loadOptionals( req ), additionals ? additionals : {} );

  cmn.writeToCookie( req, res, 'signin-optionals', toStore );

}

function restoreOptionals( req, res ) {

  var optionals = cmn.readCookie( req, res, 'signin-optionals', true );

  for( var o in optionals ) {

    req.query[ o ] = optionals[ o ];

  }

}