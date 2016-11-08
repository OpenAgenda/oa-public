"use strict";

const MODES = {
  CREATE: 'create',
  UPDATE: 'update'
},

utils = require( 'utils' ),

_ = require( 'lodash' ),

slugs = require( 'slugs' ),

w = require( 'when' ),

map = require( './databaseFieldMap' ),

dbParse = require( 'mysql-utils/mapper' )( map ),

logger = require( 'basic-logger' ),

validate = require( './validate' ),

defineUnique = require( 'mysql-utils/defineUnique' ),
verifyUnique = require( 'mysql-utils/verifyUnique' );

let schemas, service, knex, config, log;

module.exports = Object.assign( set, { init } );

function set( identifiers, data, options, cb ) {

  if ( _areIdentifiers( identifiers ) ) {

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

  const params = _.defaults( options, {
    protected: true,
    internal: false,
    includeImagePath: false
  } );

  w( _.assign( {}, params, {
    identifiers,
    data,
    id: false,
    filteredData: null, // filtered out data as per 'protected' option
    current: false, // as currently is 
    merged: false, // merge of db and input prior to validation
    clean: null, // validated clean data after merge
    updated: null, // get from db after update
    errors: [],  // eventual validation errors
    success: false
  } ) )

  .then( _get( {
    target: 'current',
    internal: true
  } ) )

  .then( _merge )

  .then( _setToNow( 'merged', 'updatedAt' ) )

  .then( _validate( 'merged' ) )

  .then( _filterProtected( 'clean' ) )

  .then( _verifyUnique( 'slug' ) )

  .then( _doUpdate )

  .then( _get( {
    target: 'updated',
    internal: true,
    prerequisite: v => v.success && !v.errors.length,
    includeImagePath: params.includeImagePath
  } ) )

  .done( v => {

    if ( v.success && config.interfaces ) {

      config.interfaces.onUpdate( v.current, v.updated );

    }

    cb( null, {
      event: params.internal ? v.updated : dbParse.exclude( v.updated, 'internal' ),
      valid: !v.errors.length,
      success: v.success,
      errors: v.errors
    } );

  }, cb );

}


function _create( data, options , cb ) {

  if ( cb === undefined ) {

    cb = options;
    options = {};

  }

  let params = utils.extend( {
    internal: false,
    includeImagePath: false
  }, options );


  w( utils.extend( {}, params, {
    id: false,
    data,
    clean: null,
    created: null,
    errors: [],
    identifiers: null,
    success: false
  } ) )

  .then( _verifyUniqueUidIfSet )

  .then( _createUid )

  .then( _createSlugIfNotSet )

  .then( _verifyUnique( 'slug' ) )

  .then( _setToNow( 'data', 'updatedAt' ) )

  .then( _setToNow( 'data', 'createdAt' ) )

  .then( _validate( 'data' ) )

  .then( _doCreate )

  .then( _get( {
    target: 'created', 
    internal: true, 
    prerequisite: v => v.success && !v.errors.length,
    includeImagePath: params.includeImagePath
  } ) )

  .done( v => {

    if ( v.success && config.interfaces ) {

      config.interfaces.onCreate( v.created );

    }

    cb( null, {
      event: params.internal ? v.created : dbParse.exclude( v.created, 'internal' ),
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

  if ( v.errors.length ) {

    log( 'update will not proceed' );

    return v;

  }

  return knex( schemas.event )

  .where( {
    id: v.id
  } )

  .update( dbParse.toDb( v.clean ) )

  .then( affected => {

    v.success = !!affected;

    if ( v.success ) {

      log( 'updated event %s', v.id );

    }

    return v;

  } );

}


function _doCreate( v ) {

  if ( v.errors.length ) {

    log( 'create will not proceed' );

    return v;

  }

  return knex( schemas.event )

  .insert( dbParse.toDb( v.clean ) )

  .then( result => {

    v.success = !!( result && result[ 0 ] );

    if ( !v.success ) return v;

    log( 'agenda of slug %s, uid %s, id %s successfully created', v.clean.slug, v.clean.uid, result[ 0 ] );

    v.identifiers = {
      id: result[ 0 ]
    };

    v.id = result[ 0 ];

    return v;

  } );

}


function _verifyUniqueUidIfSet( v ) {

  if ( !v.data.uid ) return v;

  return _verifyUnique( 'uid' )( v );

}


function _verifyUnique( field ) {

  return v => {

    log( 'verifying unique %s', field );

    let d = w.defer(),

    // value checked for unicity is from data for create
    // from merged values in case of update
    value = dbParse.toDb( v.id ? v.merged : v.data )[ field ];

    verifyUnique( {
      table: schemas.event,
      field,
      value,
      exclude: v.id ? { id: v.id } : false,
      mysql: config.mysql
    }, ( err, is ) => {

      if ( err ) return d.reject( err );

      if ( is ) {

        log( '%s is unique', field );

        return d.resolve( v );

      }

      log( '%s is not unique', field );

      v.errors.push( {
        field,
        code: 'duplicate',
        message: 'duplicate value found',
        origin: value
      } );

      return d.resolve( v );

    } );

    return d.promise;

  }

}


function _createUid( v ) {

  let d = w.defer();

  if ( v.data.uid ) {

    log( 'uid is already defined, no need to create new' );

    return v;

  }

  defineUnique( {
    table: schemas.event,
    field: 'uid',
    mysql: config.mysql
  }, () => Math.ceil( Math.random() * 99999999 ), ( err, uid ) => {

    if ( err ) return d.reject( err );

    v.data.uid = uid;

    log( 'created uid %s', uid );

    d.resolve( v );

  } );

  return d.promise;

}


function _get( options ) {

  let params = utils.extend( {
    clean: false,
    target: 'event',
    internal: false,
    prerequisite: () => true
  }, options );

  return v => {

    if ( !params.prerequisite( v ) ) {

      log( 'get will not proceed for target %s', params.target );

      return v;

    }

    let d = w.defer();

    service.get( v.id ? { id: v.id } : v.identifiers, {
      internal: params.internal,
      includeImagePath: params.includeImagePath
    }, ( err, data ) => {

      if ( err ) return d.reject( err );

      if ( !data ) return d.reject( 'event not found' );

      log( 'retrieved agenda of uid %s', data.uid );

      v.id = data.id;

      v[ params.target ] = data;

      d.resolve( v );

    } );

    return d.promise;

  }

}


function _createSlugIfNotSet( v ) {

  if ( v.data.slug ) return v;

  let d = w.defer(),

  title = _getFirstTitle( v.data );

  defineUnique( {
    table: schemas.event,
    field: 'slug',
    mysql: config.mysql
  }, previousSlug => slugs.generate( title, !!previousSlug ),
  ( err, slug ) => {

    if ( err ) return d.reject( err );

    log( 'created slug %s', slug );

    v.data.slug = slug;

    d.resolve( v );

  } );

  return d.promise;

}


function _filterProtected( namespace ) {

  return v => {

    if ( !v.protected ) return v;

    let data = v[ namespace ];

    if ( !data ) return v;

    v[ namespace ] = {};

    Object.keys( data ).forEach( k => {

      if ( !dbParse.is( 'obj', k, 'protected' ) ) {

        v[ namespace ][ k ] = data[ k ];

      }

    } );

    return v;

  }  

}


function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

  config = c;

  log = logger( 'events service.set' );

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


function _getFirstTitle( data ) {

  if ( !data || !data.title || typeof data.title !== 'object' ) {

    return false;

  }

  let firstLang = Object.keys( data.title )[ 0 ];

  return data.title[ firstLang ];

}


function _areIdentifiers( identifiers ) {

  if ( typeof identifiers === 'number' ) return true;

  return !Object.keys( identifiers )

    .filter( k => [ 'id', 'uid', 'slug' ].indexOf( k ) == -1 )

    .length;

}