"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const validate = require( './validate' );
const sUtils = require( '@openagenda/service-utils' );
const getConfig = require( './getConfig' );
const map = require( './databaseFieldMap' );
const cleanArgs = require( './lib/cleanArgs' );
const parseMarkdown = require( './lib/parseMarkdown' );
const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );
const decorateImage = require( './lib/decorateImage' );
const cleanGetOptions = require( './validate/getOptions' );

const log = require( '@openagenda/logs' )( 'get' );

module.exports = _.extend( get, { init } );

let knex, schemas, service, config;

function get( i, o, c ) {

  const { identifiers, options, cb } = cleanArgs( i, o, c );

  let cleanOptions = {};

  try {

    cleanOptions = cleanGetOptions( options );

  } catch( e ) {};


  const p = w( _.extend( {
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

  v.filtered.image = decorateImage( v.filtered.image, {
    imagePath: config.image.base,
    useDefaultPath: v.useDefaultImage,
    defaultPath: config.defaultImagePath
  } );

  return v.filtered;  

}


function _get( v ) {

  let query = knex( schemas.event )

    .select( dbParse.fields( 'db', v.internal, [ 'id' ] ) )

    .where( v.identifiers );

  if ( v.deleted === true ) {

    query.whereNotNull( 'deleted_at' );

  } else if ( v.deleted === false ) {

    query.whereNull( 'deleted_at' );

  }

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

  try {

  let parsed = dbParse.toObj( v.entry, false );

  v.data = _applyDefaults( parsed );

  } catch( e ) {

    log( 'error', 'event %j has invalid JSON', v.identifiers, e );

    throw new VError( 'corrupt JSON in event field', e );

  }

  if ( v.html ) {

    v.data.html = _.mapValues( v.data.longDescription, parseMarkdown );

  }

  return v;

}


function _applyDefaults( data ) {

  let defaulted = _.extend( {}, validate.default );

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

  config = c;

  knex = c.knex;

  schemas = c.schemas;

  service = svc;

}
