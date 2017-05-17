"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const validators = require( 'validators' );
const schema = require( 'validators/schema' );
const { text, link, number, email, date, boolean } = require( 'validators' );

let config;
let knex;
let service;


schema.register( {
  text,
  link,
  number,
  email,
  date,
  boolean
} );


const basicFields = [
  'id', 'uid', 'full_name', 'username', 'culture',
  'email', 'image', 'is_new', 'created_at', 'updated_at'
];
const protectedFields = [ 'is_activated' ];

const storeFields = [ 'enable_secret' ];


module.exports = Object.assign( update, {
  init
} );


function init( c, k, s ) {

  config = c;
  knex = k;
  service = s;

}

function update( identifier, data, options, cb ) {

  if ( arguments.length === 3 ) {

    cb = options;
    options = {};

  }

  const params = _.merge( {
    protected: true,
    internal: false
  }, options );

  w( {
    identifier,
    params,
    data,
    cleanedData: null,
    store: null,
    result: {
      user: null,
      errors: [],
      success: null,
      valid: null
    }
  } )
    .then( _parseIdentifier() )
    .then( _get() )
    .then( _parseStore() )
    .then( _validate() )
    .then( _formatStore() )
    .then( _update() )
    .then( v => new Promise( ( resolve, reject ) => {

      service.get( v.identifier, v.params, ( err, user ) => {

        if ( err ) return reject( err );

        v.result.user = user;

        resolve( v );

      } );

    } ) )
    .done(
      v => cb( null, Object.assign( {}, v.result, { success: !v.result.errors.length } ) ),
      err => cb( err )
    );

}

function _parseIdentifier( namespaces ) {

  namespaces = Object.assign( {
    identifier: 'identifier'
  }, namespaces );

  return v => {

    const identifier = _.get( v, namespaces.identifier );

    if ( typeof identifier === 'number' ) {

      _.set( v, namespaces.identifier, { id: identifier } );

    } else {

      _.set( v, namespaces.identifier, _.pick( identifier, [ 'uid', 'id' ] ) );

    }

    return v;

  };

}

function _get( namespaces ) {

  namespaces = Object.assign( {
    identifier: 'identifier',
    user: 'result.user',
    store: 'store'
  }, namespaces );

  return v => {

    return knex( config.schemas.user )
      .column( basicFields.concat( 'store' ) )
      .select()
      .where( _.get( v, namespaces.identifier ) )
      .limit( 1 )
      .then( users => {

        if ( users.length ) {
          _.set( v, namespaces.store, users[ 0 ].store );
          _.set( v, namespaces.user, _.omit( users[ 0 ], [ 'store' ] ) );
        }

        return v;

      } );

  };

}

function _parseStore( namespaces ) {

  namespaces = Object.assign( {
    store: 'store'
  }, namespaces );

  return v => {

    _.set( v, namespaces.store, JSON.parse( _.get( v, namespaces.store ) || '{}' ) );

    return v;

  };

}

function _validate( namespaces ) {

  namespaces = Object.assign( {
    params: 'params',
    data: 'data',
    cleanedData: 'cleanedData',
    user: 'result.user',
    errors: 'result.errors',
    valid: 'result.valid',
    store: 'store'
  }, namespaces );

  const schemaValidator = schema( {
    id: {
      type: 'number'
    },
    uid: {
      type: 'number'
    },
    full_name: {
      type: 'text',
      min: 2
    },
    username: {
      type: 'text'
    },
    culture: {
      type: 'text',
      min: 2,
      max: 2
    },
    email: {
      type: 'email'
    },
    password: {
      type: 'text',
      min: 4
    },
    salt: {
      type: 'text'
    },
    image: {
      type: 'text'
    },
    store: {
      type: 'text'
    },
    is_activated: {
      type: 'number',
      default: 0
    },
    is_removed: {
      type: 'number'
    },
    is_new: {
      type: 'number'
    },
    created_at: {
      type: 'date'
    },
    updated_at: {
      type: 'date'
    },
    enable_secret: {
      type: 'boolean'
    }
  } );

  return v => {

    const params = _.get( v, namespaces.params );

    try {

      const data = _.get( v, namespaces.data );

      const fieldsToClean = [
        'full_name',
        'username',
        'culture',
        'image'
      ].concat( !params.protected ? [
        'id',
        'uid',
        'email',
        'is_activated',
        'is_new'
      ] : [] ).concat( params.internal ? [
        'created_at',
        'updated_at',
        'enable_secret'
      ] : [] ).filter( v => Object.keys( data ).includes( v ) );

      const cleanedData = schemaValidator.part( fieldsToClean, data );

      _.set( v, namespaces.cleanedData, cleanedData );
      _.set( v, namespaces.valid, true );

    } catch ( e ) {

      _.set( v, namespaces.errors, _.get( v, namespaces.errors ).concat( e ) );
      _.set( v, namespaces.valid, false );

    }

    return v;

  };

}

function _formatStore( namespaces ) {

  namespaces = Object.assign( {
    store: 'store',
    cleanedData: 'cleanedData'
  }, namespaces );

  return v => {

    const newStore = _.merge( _.get( v, namespaces.store ), _.pick( _.get( v, namespaces.cleanedData ), storeFields ) );

    _.set( v, namespaces.store, JSON.stringify( newStore ) );

    return v;

  };

}

function _update( namespaces ) {

  namespaces = Object.assign( {
    identifier: 'identifier',
    params: 'params',
    cleanedData: 'cleanedData',
    store: 'store',
    errors: 'result.errors'
  }, namespaces );

  return v => {

    if ( _.get( v, namespaces.errors ).length ) {

      return v;

    }

    const params = _.get( v, namespaces.params );
    const data = _.get( v, namespaces.cleanedData );

    const dataToUpdate = _.pick( data, basicFields.concat( params.protected ? protectedFields : [] ) );
    dataToUpdate.store = _.get( v, namespaces.store );

    return knex( config.schemas.user ).update( dataToUpdate ).where( _.get( v, namespaces.identifier ) )
      .then( () => v );

  };

}
