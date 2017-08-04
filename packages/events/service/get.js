"use strict";

const utils = require( 'utils' ),

  w = require( 'when' ),

  getConfig = require( './getConfig' ),

  map = require( './databaseFieldMap' ),

  cleanArgs = require( './lib/cleanArgs' ),

  cleanGetOptions = require( './validate/getOptions' ),

  dbParse = require( 'mysql-utils/mapper' )( map ),

  validate = require( './validate' ),

  sUtils = require( 'service-utils' ),

  logger = require( 'basic-logger' );

module.exports = utils.extend( get, { init } );

let knex, schemas, service, log;

function get( i, o, c ) {

  const { identifiers, options, cb } = cleanArgs( i, o, c );

  let cleanOptions = {};

  try {

    cleanOptions = cleanGetOptions( options );

  } catch( e ) {};


  const p = w( utils.extend( {
    identifiers,
    internal: false,
    includeImagePath: false,
    useDefaultImage: false,
    private: false
  }, cleanOptions, {
    entry: null,
    data: null,
    filtered: null
  } ) )

    .then( sUtils.identifiers.clean() )

    .then( _get )

    .then( _transform )

    .then( _filterInternals )

    .then( _cleanResult );


  if ( cb === null ) return p;

  p.catch( cb );

  p.then( cb.bind( null, null ) );

}


function _cleanResult( v ) {

  if ( !v.filtered ) {

    return null;

  }

  if ( v.includeImagePath && v.filtered.image ) {

    v.filtered.image = imagePath + v.filtered.image;

  } else if ( v.useDefaultImage && !v.filtered.image ) {

    v.filtered.image = getConfig().defaultImagePath;

  }

  return v.filtered;  

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

  let parsed = dbParse.toObj( v.entry, false );

  v.data = _applyDefaults( parsed );

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

  log = logger( 'events service/get' );

}