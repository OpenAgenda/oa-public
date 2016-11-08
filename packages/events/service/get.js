"use strict";

const utils = require( 'utils' ),

w = require( 'when' ),

map = require( './databaseFieldMap' ),

dbParse = require( 'mysql-utils/mapper' )( map ),

validate = require( './validate' ),

sUtils = require( 'service-utils' );

module.exports = utils.extend( get, { init } );

let knex, schemas, service;

function get( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  w( utils.extend( {
    identifiers,
    internal: false,
    includeImagePath: false,
    private: false
  }, options, {
    entry: null, 
    data: null,
    filtered: null
  } ) )

  .then( sUtils.identifiers.clean() )

  .then( _get )

  .then( _transform )

  .then( _filterInternals )

  .done( v => {

    if ( !v.filtered ) return cb( null, null );

    if ( v.includeImagePath && v.filtered.image ) {

      v.filtered.image = imagePath + v.filtered.image;

    }

    cb( null, v.filtered );    

  }, cb );


}


function _get( v ) {

  let query = knex( schemas.event )

  .select( dbParse.fields( 'db', v.internal, [ 'id' ] ) )

  .where( v.identifiers )

  .whereNull( 'deleted_at' );

  if ( v.private !== null ) {

    query.andWhere( 'private', v.private );

  }

  return query.then( rows => {

    if ( !rows.length ) return v;

    v.entry = rows[ 0 ];

    return v;

  } );

}


function _transform( v ) {

  if ( !v.entry ) return v;

  v.data = dbParse.toObj( v.entry );

  v.data = _applyDefaults( v.data );

  return v;

}


function _applyDefaults( data ) {

  let defaulted = utils.extend( {}, validate.default );

  Object.keys( data ).forEach( k => {

    defaulted[ k ] = data[ k ] === null ? defaulted[ k ] : data[ k ];

  } );

  return defaulted;

}


function _filterInternals( v ) {

  if ( !v.data ) return v;

  v.filtered = {};

  Object.keys( v.data ).filter( f => v.internal || !dbParse.is( 'obj', f, 'internal' ) ).forEach( f => {

    v.filtered[ f ] = v.data[ f ];

  } );

  return v;

}


function init( svc, c ) {

  knex = c.knex;

  schemas = c.schemas;

  service = svc;

}