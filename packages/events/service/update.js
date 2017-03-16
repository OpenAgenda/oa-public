"use strict";

const _ = require( 'lodash' ),

  w = require( 'when' ),

  get = require( './lib/get.w' ),

  now = require( './lib/now.w' ),

  draft = require( './lib/draft.w' ),

  logger = require( 'basic-logger' ),

  unique = require( './lib/unique.w' ),

  map = require( './databaseFieldMap' ),

  validate = require( './lib/validate.w' ),

  dbParse = require( 'mysql-utils/mapper' )( map );

let schemas, service, knex, config, log;

module.exports = _.extend( function( identifiers, data, options, cb ) {

  if ( cb === undefined ) {

    cb = options;
    options = {};

  }

  const params = _.defaults( options, {
    protected: true,
    internal: false,
    includeImagePath: false,
    draft: false
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

  .then( get( {
    log,
    get: service.get,
    target: 'current',
    internal: true
  } ) )

  .then( _merge )

  .then( now.setTo( 'merged', 'updatedAt' ) )

  .then( draft( 'merged' ) )

  .then( validate( { target: 'merged', log } ) )

  .then( _filterProtected( 'clean' ) )

  .then( unique.verify( {
    mysql: config.mysql, 
    table: schemas.event, 
    field: 'slug', 
    log 
  } ) )

  .then( _doUpdate )

  .then( get( {
    log,
    get: service.get,
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

}, {
  init: ( svc, c ) => {

    service = svc;

    schemas = c.schemas;

    knex = c.knex;

    config = c;

    log = logger( 'events service/update' );

  }
} );


function _merge( v ) {

  v.merged = _.extend( {}, v.current, v.data );

  return v;

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