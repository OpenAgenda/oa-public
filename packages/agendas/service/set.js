"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const slug = require( 'slug' );

const MODES = {
  CREATE: 'create',
  UPDATE: 'update'
};

const defineUnique = require( '@openagenda/mysql-utils/defineUnique' );
const verifyUnique = require( '@openagenda/mysql-utils/verifyUnique' );

const get = require( './get' );
const legacy = require( './legacy' );
const map = require( './databaseFieldMap' );
const validate = require( './validate' );

const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );
const log = require( '@openagenda/logs' )( 'set' );

let knex, schemas, mysqlConfig, interfaces;

module.exports = _.extend( set, { init } );

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

  let params = _.extend( {
    // option defaults
    protected: true, // protected fields cannot be tampered with
    internal: false, // retrieve internal fields when update is done
    private: false,
    includeImagePath: false,
    context: null
  }, options );

  w( _.extend( {}, params, {
    // unoptionables
    identifiers,
    id: false,
    data: Object.assign( {}, data ),
    filteredData: null, // after protected values have been removed from input
    current: false, // what is in db before update
    merged: false, // merge of input and current db values
    clean: null, // after validation
    updated: null,
    errors: [] // validation errors
  } ) )

  .then( _get( { target: 'current', internal: true, private: params.private } ) )

  .then( _merge )

  .then( _setToNow( 'merged', 'updatedAt' ) )

  .then( _timestampOfficial )

  .then( _validate( 'merged' ) )

  // filter must happen after validate to avoid
  // incomplete data validation errors
  .then( _filterProtected.bind( null, 'clean' ) )

  .then( _verifyUnique( 'slug' ) )

  .then( _doUpdate )

  .then( _applyToLegacy )

  .then( _get( {
    target: 'updated',
    internal: true,
    prerequisite: v => v.success && !v.errors.length,
    includeImagePath: params.includeImagePath,
    private: params.private
  } ) )

  .done( v => {

    if ( v.success && interfaces ) {

      interfaces.onUpdate( v.current, v.updated, v.context );

    }

    cb( null, {
      agenda: params.internal ? v.updated : dbParse.exclude( v.updated, 'internal' ),
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

  let params = _.extend( {
    internal: false,
    includeImagePath: false
  }, options );

  w( _.extend( {}, params, {
    id: false,
    data: Object.assign( {}, data ),
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

  .then( _applyToLegacy )

  .then( _get( {
    target: 'created',
    internal: true,
    prerequisite: v => v.success && !v.errors.length,
    includeImagePath: params.includeImagePath
  } ) )

  .done( async v => {

    const response = {
      agenda: params.internal ? v.created : dbParse.exclude( v.created, 'internal' ),
      valid: !v.errors.length,
      success: v.success,
      errors: v.errors
    };

    if (v.success && _.get(interfaces, 'onCreate')) {
      try {
        await interfaces.onCreate(v.created);
      } catch (e) {
        log('error', 'interface onCreate call errored', e);
      }
    }

    cb( null, response );

  }, cb );

}


function _hasCallback( fn ) {

  return fn.length === 2;

}


function _validate( target ) {

  return v => {

    try {

      v.clean = validate( v[ target ] );

    } catch( e ) {

      log( 'validation failed with %s errors: %s', e.length, JSON.stringify( e ) );

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

    if ( v.success ) {

      log( 'info', 'updated agenda %s', v.id );

    }

    return v;

  } );

}


function _applyToLegacy( v ) {

  if ( !v.success ) return v;

  let d = w.defer();

  legacy( v.id ).applyToLegacy( v.clean, err => {

    if ( err ) {

      log( 'error', {
        message: 'agenda legacy save triggered error',
        error: err
      } );

    } else {

      log( 'applied agenda configuration to legacy data structure' );

    }

    d.resolve( v );

  } );

  return d.promise;

}


function _doCreate( v ) {

  if ( v.errors.length ) {

    log( 'create will not proceed' );

    return v;

  }

  _.set( v, 'clean.credentials.useContributeApp', true );
  _.set( v, 'clean.credentials.useAgendaSchema', true );

  return knex( schemas.agenda )

  .insert( dbParse.toDb( v.clean ) )

  .then( result => {

    v.success = !!( result && result[ 0 ] );

    if ( !v.success ) return v;

    log( 'info', 'agenda of slug %s, uid %s, id %s successfully created', v.clean.slug, v.clean.uid, result[ 0 ] );

    v.identifiers = {
      id: result[ 0 ]
    };

    v.id = result[ 0 ];

    return v;

  } );

}


function _areIdentifiers( identifiers ) {

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

    let d = w.defer(),

    // value checked for unicity is from data for create
    // from merged values in case of update
    value = dbParse.toDb( v.id ? v.merged : v.data )[ field ];

    verifyUnique( {
      table: schemas.agenda,
      field,
      value,
      exclude: v.id ? { id: v.id } : false,
      mysql: mysqlConfig
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


/**
 * filters out protected fileds from given object if protected option is set
 */
function _filterProtected( namespace, v ) {

  if ( !v.protected ) return v;

  let data = v[ namespace ] || {};

  v[ namespace ] = {};

  Object.keys( data ).forEach( k => {

    if ( !dbParse.is( 'obj', k, 'protected' ) ) {

      v[ namespace ][ k ] = data[ k ];

    }

  } );

  return v;

}


function _merge( v ) {

  const customizer = ( obj, src, key ) => {
    if ( _.isArray( src ) && key === 'moderateOnChangeBy' ) {
      return src;
    }
  };

  v.merged = _.mergeWith( {}, v.current, v.data, customizer );

  return v;

}


function _setToNow( target, field ) {

  return v => {

    v[ target ][ field ] = new Date();

    return v;

  }

}


function _get( options ) {

  let params = _.extend( {
    clean: false,
    target: 'agenda',
    internal: false,
    private: false,
    prerequisite: () => true
  }, options );

  return v => {

    if ( !params.prerequisite( v ) ) {

      log( 'get will not proceed for target %s', params.target );

      return v;

    }

    let d = w.defer();

    get( v.id ? { id: v.id } : v.identifiers, {
      internal: params.internal,
      includeImagePath: params.includeImagePath,
      private: params.private
    }, ( err, data ) => {

      if ( err ) return d.reject( err );

      if ( !data ) return d.reject( new Error( 'agenda not found' ) );

      log( 'retrieved agenda of uid %s', data.uid );

      v.id = data.id;

      v[ params.target ] = data;

      d.resolve( v );

    } );

    return d.promise;

  }

}


function _timestampOfficial( v ) {

  if ( !v.current.official && v.merged.official ) {

    v.merged.officializedAt = new Date();

  }

  return v;

}


function init( s, k ) {

  schemas = s.getConfig().schemas;

  knex = k;

  mysqlConfig = s.getConfig().mysql;

  interfaces = s.getConfig().interfaces;

}
