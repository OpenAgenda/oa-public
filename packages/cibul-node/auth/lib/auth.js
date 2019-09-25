"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const qs = require( 'qs' );

const labels = require( '@openagenda/labels/auth/messages' );
const emailValidator = require( '@openagenda/validators/email' )();
const getLabel = require( '@openagenda/labels' )( labels );
const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'auth/lib/auth' );

const cmn = require( '../../lib/commons-app' );
const lib = require( '../../lib/lib' );
const config = require( '../../config' );
const usersSvc = require( '../../services/users' );
const pLib = require( './passport' );
const loadAgenda = require( '../../services/agenda' ).mw.load( 'slug', { basicLoad: true, cache: true, required: false } );

const authenticateFields = {
  facebook: 'facebookUid',
  twitter: 'twitterId',
  google: 'googleId',
  twitterScreenName: 'twitterScreenName'
};

const createFields = {
  facebook: 'facebookUid',
  twitter: 'twitterId',
  google: 'googleId',
};

const exposed = {
  signin,
  layoutData,
  ifUserLoaded,
  ifUserActivated,
  ifUnresolved,
  redirectToComplete,
  redirectToResend,
  loadOptionals,
  saveOptionals,
  restoreOptionals,
  serviceCallback,
  fullNameFromEmail,
  done, // when a controller is done
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

exposed.renderInvalidActivation = _render( 'auth/invalidActivation', {} );

function init( service ) {

  const authenticate = serviceAuthenticate( authenticateFields[ service ] );
  const create = serviceCreate( createFields[ service ], service !== 'twitter' );

  return _.merge( {
    create,
    authenticate,
    attemptAuth,
    attemptCreate,
    process,
    errors: {}
  }, exposed );


  function attemptAuth( values ) {

    values.req.log( 'attempting authentication for %s with %s', service, JSON.stringify( values.profile ) );

    if ( values.resolved ) {

      values.req.log( 'already resolved, returning values' );

      return values;

    }

    return w.promise( function( resolve, reject ) {

      const options = {};

      if ( !values.profile ) {

        values.req.log( 'profile is not set' );

        return resolve( values );

      }

      authenticate( values.profile.id, ( err, user, data ) => {

        if ( err ) values.err = err;

        if ( user ) {

          values.req.log( 'user is loaded' );

          values.user = user;

        } else {

          values.req.log( 'no user was loaded' );

        }

        if ( data ) _.merge( values.data, data );

        resolve( values );

      });

    });

  }


  /**
   * try to create an account with profile info
   */

  function attemptCreate( values ) {

    if ( !values.profile ) {

      values.req.log( 'profile data is not in hand, aborting attemptCreate', {
        service,
        values
      } );

      if ( !values.data ) values.data = {};

      values.data.message = getLabel( 'abortedAuth', { service }, values.req.lang );

      return values;

    }

    if ( service === 'facebook' && !values.profile.email ) {

      values.req.log( 'profile email is not in hand, aborting attemptCreate', {
        service,
        values
      } );

      if ( !values.data ) values.data = {};

      values.err = { message: getLabel( 'facebookEmailMissing', values.req.lang ) }

      return values;

    }

    values.req.log( '%s attempting account creation with %s', service, JSON.stringify( values.profile ) );

    return w.promise( function( resolve, reject ) {

      const options = loadOptionals( values.req );

      const fullName = values.profile.fullName.length ? values.profile.fullName : fullNameFromEmail( values.profile.email );

      if ( values.req.agenda ) options.agenda = values.req.agenda;

      if ( !values.profile ) {

        return resolve( values );

      }

      create( {
        id: values.profile.id,
        email: values.profile.email,
        fullName,
        culture: values.req.lang
      }, options, function( err, user, data ) {

        if ( err ) values.err = err;

        if ( user ) {

          values.req.log( 'account was created' );

          values.user = user;

        } else {

          values.req.log( 'no account was created' );

        }

        if ( data ) {

          values.data = _.merge( values.data ? values.data : {}, data );

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

        .then( ifUnresolved( ifUserLoaded( false, errorDefaultMessage ) ) )

        .then( ifUnresolved( ifUserLoaded( false, module.exports[ name == 'signup' ? 'renderSignup' : 'renderSignin' ] ) ) )

        .done( done , cmn.catchError( req, res ) );

      } )( req, res, next );

    } );

  }

}

module.exports = init;

lib.extend( init, exposed );

function serviceCreate( fieldName, activate ) {

  return ( data, optionals, cb ) => {

    if ( !cb ) {
      cb = optionals;
      optionals = {};
    }

    const createData = {
      email: data.email,
      fullName: data.fullName,
      culture: data.culture ? data.culture : 'fr',
      isActivated: !!activate,
      [ fieldName ]: data.id,
    };

    log( 'creating user with %j', createData );

    usersSvc.create( createData, { detailed: true, tokenOptionals: optionals, optionals } )
      .then( user => {
        if ( user ) {
          log( 'user successfully created' );
        }

        return {
          createData,
          user,
          service: { [ fieldName ]: data.id },
        };
      } )
      .then( values => cb( null, values.user, values ), err => {

        console.log( err )
        cb( err );

      } );

  };

}

function serviceAuthenticate( fieldName ) {

  return ( id, cb ) => {

    const values = {
      fieldName,
      id,
    };

    usersSvc.findOne( {
      query: { [ fieldName ]: id },
      detailed: true,
    } )
      .then( user => {
        values.user = user;
      } )
      .catch( err => {
        if ( err.name !== 'NotFound' ) {
          log( 'error', err );
        }

        if ( !values.errors ) {
          values.errors = {};
        }

        values.errors.service = 'This user does not exist';
      } )
      .then( () => {
        if ( !values.user || values.user.isActivated ) return values;

        values.inactive = true;

        if ( !values.errors ) values.errors = {};

        values.errors.message = 'The account matching this email is not activated';

        return values;
      } )
      .then(
        () => cb( null, values.user, values ),
        cb,
      );

  };

}

function signin( values ) {

  var req = values.req,

  res = values.res,

  user = values.user,

  agendaSlug,

  d = w.defer();

  if ( values.resolved ) {

    return values;

  }

  if ( req.query.agenda ) {

    agendaSlug = req.query.agenda;

  } else if ( req.agenda ) {

    agendaSlug = req.agenda.slug;

  }

  values.resolved = true;

  values.req.log( 'info', 'signing in user %s', user.email );

  sessions.open( req, res, user, async ( err, session ) => {

    if ( err ) req.log( 'error', { message: 'could not open session', error: err } );

    let redirectUrl;

    usersSvc.refresh( user.uid, {
      lastSignin: true
    } )
      .catch( err => {

        if ( err ) req.log( 'error', { message: 'could not refresh lastSignin', error: err } );

      } );

    if ( req.query.redirect ) {

      try {

        redirectUrl = Buffer.from( req.query.redirect, 'base64' ).toString();

      } catch ( e ) {

        req.log( 'error', 'could not decode redirect %s', req.query.redirect );

      }

    } else if ( req.query.iToken && agendaSlug ) {

      // this is a invitation signin / signup, redirect to form.
      redirectUrl = req.genUrl( 'agendaEventNew', { slug: agendaSlug } )

    }

    if ( redirectUrl ) {

      req.log( 'info', 'signin in successful, redirecting to %s', redirectUrl );

      res.redirect( redirectUrl );

      d.resolve( values );

      return;

    }

    res.redirect( 302, agendaSlug ? req.genUrl( 'agendaShow', { slug: agendaSlug } ) : '/home' );

    d.resolve( values );

  } );

  return d.promise;

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

    data = _.merge( {}, defaults );

    data.culture = req.query.lang || req.lang;

    if ( req.agenda ) {

      data.agenda = {
        slug: req.agenda.slug,
        title: req.agenda.title,
        description: req.agenda.description,
        image: req.agenda.image,
        url: req.agenda.url
      };

    }

    if ( asPromise ) {

      values.resolved = true;

      if ( values.err ) _.merge( data, values.err );

      data = _.merge( data, values.data ? values.data : {} );

    } else {

      _.merge( data, arguments.length === 3 ? arguments[ 2 ] : {} );

    }

    if ( req.query.msg ) {

      data.headMessage = labels[ req.query.msg ] ? labels[ req.query.msg ][ req.lang ] : false;

    }

    data.enabledServices = [];

    data.signin = `${req.agenda ? '/' + req.agenda.slug : '' }/signin${qs.stringify( {
      ... loadOptionals( req )
    }, { addQueryPrefix: true } )}`;

    if ( _.get( config, 'auth.facebook.id' ) ) data.enabledServices.push( 'facebook' );
    if ( _.get( config, 'auth.google.id' ) ) data.enabledServices.push( 'google' );
    if ( _.get( config, 'auth.twitter.key' ) ) data.enabledServices.push( 'twitter' );

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

    values.err.message = labels.genericError[ values.req.lang ];

  }

  return values;

}


function errorExistingEmail( values ) {

  if ( values.resolved ) return values;

  values.req.log( 'checking if account with same email exists' );

  if ( values.data && values.data.errors && values.data.errors.email ) {

    values.req.log( 'an account exists with email: %s', JSON.stringify( values.profile ) );

    delete values.data.errors.email;

    values.data.message = labels.accountEmailAlreadyExists[ values.req.lang ];

    return exposed.renderSignin( values );

  }

  return values;

}


function redirectToResend( values ) {

  values.resend = true;

  return redirectToComplete( values );

}


function redirectToComplete( values ) {

  let res;

  if ( values.resend ) {
    res = '/activate/resend';
  } else if ( values.req.agenda ) {
    res = `/${values.req.agenda.slug}/signup/complete`;
  } else {
    res = '/signup/complete';
  }

  values.res.redirect( 302, `${res}?${qs.stringify( {
    ... loadOptionals( values.req ),
    email: values.user.email,
    ... values.req.agenda ? { slug: values.req.agenda.slug } : {}
  } )}` );

  values.resolved = true;

  return values;

}


function layoutData( req ) {

  const data = {
    optionals: loadOptionals( req ),
    agenda: req.agenda ? req.agenda : false
  };

  return data;

}

function loadOptionals( req ) {

  const optionals = {};

  if ( req.query.iToken ) {

    optionals.iToken = req.query.iToken;

  }

  if ( req.query.invitation ) {

    optionals.invitation = req.query.invitation;

  }

  if ( req.query.redirect ) {

    optionals.redirect = req.query.redirect;

  }

  if ( req.query.agenda ) {

    optionals.agenda = req.query.agenda;

  }

  return optionals;

}


function fullNameFromEmail( emailInput ) {

  let email;

  try {

    email = emailValidator( emailInput );

  } catch( e ) {

    return false;

  }

  let parts = email.split( '@' ),

  name = parts[ 0 ]

  .split( /[\._]/g )

  .map( s => s[ 0 ].toUpperCase() + s.substr( 1 ) )

  .join( ' ' ),

  at = ( parts[ 1 ][ 0 ].toUpperCase() + parts[ 1 ].substr( 1 ) ).split( '.' )[ 0 ];

  return name + ' ' + at

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
