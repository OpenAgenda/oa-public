"use strict";

const _ = require( 'lodash' ),

  w = require( 'when' ),

  get = require( './lib/get.w' ),

  now = require( './lib/now.w' ),

  draft = require( './lib/draft.w' ),

  logger = require( '@openagenda/basic-logger' ),

  unique = require( './lib/unique.w' ),

  map = require( './databaseFieldMap' ),

  validate = require( './lib/validate.w' ),

  cleanUpdateArgs = require( './lib/cleanUpdateArgs' ),

  cleanUpdateOptions = require( './validate/updateOptions' ),

  dbParse = require( '@openagenda/mysql-utils/mapper' )( map );

let schemas, service, knex, config, log;

module.exports = _.extend( function( i, d, o, c ) {

  const { identifiers, data, options, cb } = cleanUpdateArgs( i, d, o, c );

  let cleanOptions = {};

  try {

    cleanOptions = cleanUpdateOptions( options );

  } catch ( e ) {}

  const p = w( _.extend( {}, cleanOptions, {
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

    .then( now.setTo( 'merged', 'updatedAt', cleanOptions.protected ) )

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
      includeImagePath: cleanOptions.includeImagePath
    } ) )

    .then( _cleanResult );

  if ( cb === null ) return p;

  p.catch( cb );

  p.then( cb.bind( null, null ) );

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


function _cleanResult( v ) {

  if ( v.success && config.interfaces ) {

    config.interfaces.onUpdate( v.current, v.updated, v.context );

  }

  return {
    event: v.internal ? v.updated : dbParse.exclude( v.updated, 'internal' ),
    valid: !v.errors.length,
    success: v.success,
    errors: v.errors
  };

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