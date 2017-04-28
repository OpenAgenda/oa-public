"use strict";

var log = require( 'logger' )( 'user service' ),

  lib = require( '../../lib/lib' ),

  config = require( '../../config' ),

  model = require( 'cibulModel' )( config.db ),

  activation = require( './lib/activation' ),

  lostPassword = require( './lib/lostPassword' ),

  invitationSvc = require( '../invitation' ),
  invitation2Svc = require( 'invitations' ),

  activitiesSvc = require( 'activities' ),

  async = require( 'async' ),

  w = require( 'when' );

module.exports = {
  get,
  auth: authenticate,
  create,
  onActivation: onActivation,
  updateTwitterId: updateTwitterId // tmp method required as long as there are twitter accounts with screen_name ref only
}

module.exports.activation = activation( module.exports );

module.exports.lostPassword = lostPassword( module.exports );


authenticate.facebook = _serviceAuthenticate( 'facebookUid' );
authenticate.twitter = _serviceAuthenticate( 'twitterId' );
authenticate.google = _serviceAuthenticate( 'googleId' );
authenticate.twitterScreenName = _serviceAuthenticate( 'twitterScreenName' );

create.facebook = _serviceCreate( 'facebookUid', true );
create.twitter = _serviceCreate( 'twitterId' );
create.google = _serviceCreate( 'googleId', true );

function authenticate( email, password, cb ) {

  w( { email: email, password: password } )

    .then( _loadUser )

    .then( activation.verify )

    .then( _verifyPassword )

    .done( function ( values ) {

      cb( null, values.user, values );

    }, cb );

}

function get( params, cb ) {

  if ( !params || !lib.size( params ) ) {

    return cb( null, false );

  }

  log( 'getting user %s', JSON.stringify( params ) );

  model.users().get( params, ( err, user ) => {

    if ( err || !user ) return cb( err, false );

    cb( null, model.users().instance( user ) );

  } );

}

function _serviceAuthenticate( serviceFieldName ) {

  return function ( id, options, cb ) {

    if ( !cb ) {

      cb = options;

      options = {};

    }

    w( { fieldName: serviceFieldName, id: id } )

      .then( _findUserByServiceId )

      .then( activation.verify )

      .done( function ( values ) {

        cb( null, values.user, values );

      }, cb );

  }

}


function create( data, options, cb ) {

  if ( !cb ) {

    cb = options;

    options = {};

  }

  _createProcess( data, options )

    .done( function ( values ) {

      cb( null, values.user, values );

    }, cb );

}


function updateTwitterId( user, profile ) {

  if ( !user || !profile ) {

    return cb( 'user or profile is missing' );

  }

  model.users().update( { id: user.id }, { twitterId: profile.id }, function ( err, result ) {

    if ( err ) {

      log( 'error', 'had trouble updating twitterId: %s', JSON.stringify( err ) );

    } else {

      log( 'twitter id has been fetched and saved for user %s: %s', user.id, JSON.stringify( result ) );

    }

  } );

}


function _serviceCreate( serviceFieldName, activate ) {

  return function ( data, options, cb ) {

    if ( !cb ) {

      cb = options;

      options = {};

    }

    var createData = {
        email: data.email,
        fullName: data.fullName,
        culture: data.culture ? data.culture : 'fr'
      },

      serviceData = {};

    serviceData[ serviceFieldName ] = data.id;

    _createProcess( lib.extend( {}, createData, serviceData, { isActivated: !!activate } ), options )

      .done( function ( values ) {

        values.service = serviceData;

        cb( null, values.user, values );

      }, cb );


  }

}


function _createProcess( createData, options ) {

  return w( lib.extend( { createData: createData }, options ? options : {} ) )

    .then( _validateAndCreate )

    .then( _isLoaded( 'user', invitationSvc.preprocessUser ) )

    .then( _isLoaded( 'user', _ifIsActivated( true, onActivation ) ) )

    .then( _isLoaded( 'user', _ifIsActivated( false, activation.createAndSend ) ) )

}


/**
 * there will be stuff to do on activation of a user account. Do it here
 */

function onActivation( values ) {

  return activitiesSvc.feed( { entityType: 'user', entityUid: values.user.uid } ).create()
    .then( () => {

      return ( values.invitation ? invitation2Svc.execute( { token: values.invitation }, { user: values.user } ) : w() )

        .then( () => invitationSvc.processUser( values ) );

    } );

}


function _validateAndCreate( values ) {

  return w.promise( ( resolve, reject ) => {

    log( 'validating and creating user with %s', JSON.stringify( values.createData ) );

    model.users().validateAndCreate( values.createData, ( err, user, result ) => {

      if ( err ) return reject( err );

      if ( result ) lib.extend( values, result );

      if ( user ) {

        log( 'user successfully created' );

        values.user = model.users().instance( user );

      }

      resolve( values );

    } );

  } );

}


function _isLoaded( field, func ) {

  return function ( values ) {

    if ( !values[ field ] ) return w( values );

    return func( values );

  }

}

function _ifIsActivated( expected, func ) {

  return function ( values ) {

    if ( values.user.isActivated !== expected ) return w( values );

    if ( !func ) return values;

    return func( values );

  };

}


function _loadUser( values ) {

  return w.promise( ( rs, rj ) => {

    get( { email: values.email }, ( err, user ) => {

      if ( err ) return rj( err );

      if ( !user ) {

        if ( !values.errors ) values.errors = {};

        values.errors.email = 'This email does not match any existing account';

      } else {

        values.user = user;

      }

      rs( values );

    } );

  } );

}


function _findUserByServiceId( values ) {

  return w.promise( ( rs, rj ) => {

    var getData = {};

    getData[ values.fieldName ] = values.id;

    get( getData, ( err, user ) => {

      if ( err ) return rj( err );

      if ( user ) {

        values.user = user;

      } else {

        if ( !values.errors ) values.errors = {};

        values.errors.service = 'This user does not exist';

      }

      rs( values );

    } );

  } );

}


function _verifyPassword( values ) {

  if ( !values.user ) return values;

  if ( values.inactive ) return values;

  return w.promise( function ( resolve, reject ) {

    model.users().validateEmailAndPassword( values.user.email, values.password, function ( err, ok ) {

      if ( err ) return reject( err );

      if ( !ok ) {

        if ( !values.errors ) values.errors = {};

        values.errors.password = 'This password is incorrect';

        values.user = null;

      }

      resolve( values );

    } );

  } );

}