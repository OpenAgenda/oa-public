"use strict";

const MODES = {
  CREATE: 'create',
  UPDATE: 'update'
},

w = require( 'when' ),

get = require( './get' ),

utils = require( 'utils' ),

slug = require( 'slug' ),

defineUnique = require( 'mysql-utils/defineUnique' ),

logger = require( 'basic-logger' );

let knex, schemas, mysqlConfig, log,

dbParse = require( './lib/mysqlParse' )( require( './validate' ).map ),

validate = require( './validate' );

module.exports = set;
module.exports.init = init;

function set( identifiers, data, options, cb ) {

  if ( _isIdentifiers( identifiers ) ) {

    _update( identifiers, data, options, cb );

  } else {

    _create( identifiers, data, options );

  }

}


function _update( identifiers, data, options, cb ) {

  if ( cb === undefined ) {

    cb = options;
    options = {};

  }

  w( utils.extend( {
    // option defaults
    protected: true, // protected fields cannot be tampered with
    internal: false // retrieve internal fields when update is done
  }, options, {
    // unoptionables
    identifiers: identifiers,
    id: false,
    data: data,
    filteredData: null, // after protected values have been removed from input
    current: false, // what is in db before update
    merged: false, // merge of input and current db values
    clean: null, // after validation
    updated: null,
    errors: [] // validation errors
  } ) )

  .then( _get( { target: 'current', internal: true } ) )

  .then( _filterProtected )

  .then( _merge )

  .then( _setToNow( 'merged', 'updatedAt' ) )

  .then( _validate( 'merged' ) )

  .then( _verifyUnique( 'slug' ) )

  .then( _verifyUnique( 'uid' ) )

  .then( _doUpdate )

  .then( _get( {
    target: 'updated',
    internal: options.internal,
    prerequisite: v => v.success && !v.errors.length
  } ) )

  .done( v => {

    cb( null, {
      agenda: v.updated,
      valid: !v.errors.length,
      success: v.success,
      errors: v.errors
    } );

  }, cb );

}


function _create( data, options, cb ) {

  if ( cb === undefined ) {

    cb = options;
    options = {};

  }

  w( utils.extend( {
    // option defaults
    internal: false
  }, options, {
    id: false,
    data: data,
    clean: null,
    created: null,
    errors: [],
    identifiers: null,
    success: false
  } ) )

  .then( _createUid )

  .then( _createSlugIfNotSet )

  .then( _verifyUnique( 'slug' ) )

  .then( _setToNow( 'data', 'updatedAt' ) )

  .then( _setToNow( 'data', 'createdAt' ) )

  .then( _validate( 'data' ) )

  .then( _doCreate )

  .then( _get( { 
    target: 'created', 
    internal: options.internal, 
    prerequisite: v => v.success && !v.errors.length 
  } ) )

  .done( v => {

    cb( null, {
      agenda: v.created,
      valid: !v.errors.length,
      success: v.success,
      errors: v.errors
    } );

  }, cb );

}


function _validate( target ) {

  return v => {

    try {

      v.clean = validate( v[ target ] );

    } catch( e ) {

      log( 'validation failed with %s errors', e.length );

      v.errors = v.errors.concat( e );

    }

    return v;

  }

}


function _doUpdate( v ) {

  if ( v.errors.length ) return v;

  return knex( schemas.agenda )

  .where( {
    id: v.id
  } )

  .update( dbParse.toDb( v.clean ) )

  .then( affected => {

    v.success = !!affected;

    return v;

  } );

}


function _doCreate( v ) {

  if ( v.errors.length ) {

    log( 'create will not proceed' );

    return v;

  }

  return knex( schemas.agenda )

  .insert( dbParse.toDb( v.clean ) )

  .then( result => {

    v.success = !!( result && result[ 0 ] );

    if ( !v.success ) return v;

    log( 'agenda of slug %s, uid %s, id %s successfully created', v.clean.slug, v.clean.uid, result[ 0 ] );

    v.identifiers = {
      id: result[ 0 ]
    };

    return v;

  } );

}


function _isIdentifiers( identifiers ) {

  if ( typeof identifiers === 'number' ) return true;

  return !Object.keys( identifiers )

    .filter( k => [ 'id', 'uid', 'slug' ].indexOf( k ) == -1 )

    .length;

}


function _createUid( v ) {

  let d = w.defer();

  defineUnique( {
    table: schemas.agenda,
    field: 'uid',
    mysql: mysqlConfig
  }, () => Math.ceil( Math.random() * 99999999 ), ( err, uid ) => {

    if ( err ) return d.reject( err );

    v.data.uid = uid;

    log( 'created uid %s', uid );

    d.resolve( v );

  } );

  return d.promise;

}


function _createSlugIfNotSet( v ) {

  if ( v.data.slug ) return v;

  let d = w.defer();

  defineUnique( {
    table: schemas.agenda,
    field: 'slug',
    mysql: mysqlConfig
  }, previousSlug => {

    return slug( v.data.title || '', { lower: true } ) + ( previousSlug ? Math.ceil( Math.random() * 1000 ) : '' );

  }, ( err, slug ) => {

    if ( err ) return d.reject( err );

    log( 'created slug %s', slug );

    v.data.slug = slug;

    d.resolve( v );

  } );

  return d.promise;

}


function _verifyUnique( field ) {

  return v => {

    log( 'verifying unique %s', field );

    let where = {},

    value = dbParse.toDb( v.data )[ field ];

    where[ field ] = value;

    return knex( schemas.agenda )

    .select( 'id' )

    .whereNot( { id: v.id } )

    .andWhere( where )

    .then( rows => {

      if ( !rows.length ) {

        log( '%s is unique', field );

        return v;

      }

      log( '%s is not unique', field );

      v.errors.push( {
        field: field,
        code: 'duplicate',
        message: 'duplicate value found',
        origin: value
      } );

      return v;

    } );

  }

}


function _filterProtected( v ) {

  if ( !v.protected ) return v;

  let data = v.data;

  v.data = {};

  Object.keys( data ).forEach( k => {

    if ( !dbParse.isProtected( 'obj' ) ) {

      v.data[ k ] = data[ k ];

    }

  } );

  return v;

}


function _merge( v ) {

  v.merged = utils.extend( {}, v.current, v.data );

  return v;

}


function _setToNow( target, field ) {

  return v => {

    v[ target ][ field ] = new Date();

    return v;

  }

}


function _get( options ) {

  let params = utils.extend( {
    target: 'agenda',
    internal: false,
    prerequisite: () => true
  }, options );

  return v => {

    if ( !params.prerequisite( v ) ) {

      log( 'get will not proceed for target %s', params.target );

      return v;

    }

    let d = w.defer();

    get( v.identifiers, { internal: params.internal }, ( err, data ) => {

      if ( err ) return d.reject( err );

      if ( !data ) return d.reject( 'agenda not found' );

      log( 'retrieved agenda of uid %s', data.uid );

      v.id = data.id;

      v[ params.target ] = data;

      d.resolve( v );

    } );

    return d.promise;

  }

}


function init( s, k, m ) {

  schemas = s;

  knex = k;

  mysqlConfig = m;

  log = logger( 'agendas service.set' );

}