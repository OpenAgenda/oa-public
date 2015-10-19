"use strict";

var cmn = require( '../../lib/commons-app' ),

lib = require( '../../lib/lib' ),

config = require( '../../config' ),

w = require( 'when' ),

pLib = require( './passport' ),

deepExtend = require( 'deep-extend' ),

userSvc = require( '../../services/user' ),

loadAgenda = require( '../../services/agenda' ).mw.load( 'slug', { basicLoad: true, cache: true, required: false } ),

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
  serviceCallback: serviceCallback,
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
    process: process,
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

        values.req.log( 'profile is not set' );

        return resolve( values );

      }

      userSvc.auth[ service ]( values.profile.id, loadOptionals( values.req ), function( err, user, data ) {

        if ( err ) values.err = err;

        if ( user ) {

          values.req.log( 'user is loaded' ); 

          values.user = user;

        } else {

          values.req.log( 'no user was loaded' );

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

      var options = loadOptionals( values.req );

      if ( values.req.agenda ) options.agenda = values.req.agenda;

      if ( !values.profile ) {

        return resolve( values );

      }

      userSvc.create[ service ]( {
        id: values.profile.id,
        email: values.profile.email,
        fullName: values.profile.fullName,
        culture: values.req.lang
      }, options, function( err, user, data ) {

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


  /**
 * upon reception of service callback, optionnally create
 * then signin user
 */

function process( service, name ) {

  return serviceCallback( function( req, res, next ) {

    pLib.authenticate( service + '-' + name, {}, function( err, profile, data ) {

      w( { 
        req: req,
        res: res,
        err: err,
        profile: profile,
        data: data
      } )

      .then( attemptAuth )

      .then( ifUserLoaded( false, attemptCreate ) )

      .then( ifUserLoaded( false, errorExistingEmail ) )

      .then( ifUnresolved( ifUserLoaded( true, signin ) ) )

      .then( ifUnresolved( ifUserLoaded( false, errorDefaultMessage  )) )

      .then( ifUnresolved( ifUserLoaded( false, module.exports[ name == 'signup' ? 'renderSignup' : 'renderSignin' ] ) ) )

      .done( done , cmn.catchError( req, res ) );

    } )( req, res, next );

  } );

}

}

module.exports = init;

lib.extend( init, exposed );


function signin( values ) {

  var req = values.req, res = values.res, user = values.user, agendaSlug;

  if ( values.resolved ) return values;

  values.resolved = true;

  values.req.log( 'signing in user %s', user.email );

  return w.promise( ( resolve, reject ) => {

    session.set( req, res, user, () => {

      var redirectUrl;

      user.refreshLastSignin( ( err ) => {

        if ( err ) req.log( 'error', { message: 'could not refresh lastSignin', error: err } );

      });

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

      if ( req.query.agenda ) {

        agendaSlug = req.query.agenda;

      } else if ( req.agenda ) {

        agendaSlug = req.agenda.slug;

      }

      res.redirect( 302, agendaSlug ? req.genUrl( 'agendaShow', { slug: agendaSlug } ) : req.genUrl( 'homeShow' ) );

      resolve( values );

    } );

  } );

}


/**
 * upon reception of service callback, preload agenda or not
 * depending on stored optionals
 */

function serviceCallback( cb ) {

  return function( req, res, next ) {

    restoreOptionals( req, res );

    if ( req.query.agenda ) {

      req.params.slug = req.query.agenda;

      loadAgenda( req, res, function() {

        cb( req, res, next );

      } );

    } else {

      cb( req, res, next );

    }

  }

}


function _render( template, defaults ) {

  return function( values ) {

    var asPromise = arguments.length===1,

    req = asPromise ? values.req : arguments[ 0 ], 

    res = asPromise ? values.res : arguments[ 1 ],

    data = deepExtend( {}, defaults );

    if ( req.agenda ) {

      data.agenda = {
        slug: req.agenda.slug,
        title: req.agenda.title,
        description: req.agenda.description,
        image: req.agenda.image,
        url: req.agenda.url
      }

    }

    if ( asPromise ) {

      values.resolved = true;

      if ( values.err ) deepExtend( data, values.err );

      data = deepExtend( data, values.data ? values.data : {} );

    } else {

      deepExtend( data, arguments.length === 3 ? arguments[ 2 ] : {} );

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

  var uri;

  if ( values.resend ) {

    uri = 'activateResend';

  } else {

    uri = values.req.agenda ? 'agendaSignupComplete' : 'signupComplete';

  }

  values.res.redirect( 302, values.req.genUrl( uri, [ loadOptionals( values.req ), { email: values.user.email }, values.req.agenda ? { slug: values.req.agenda.slug } : {} ] ) );

  values.resolved = true;

  return values;

}


function layoutData( req ) {

  return {
    optionals: loadOptionals( req ),
    agenda: req.agenda ? req.agenda : false
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

  if ( req.query.agenda ) {

    optionals.agenda = req.query.agenda;

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