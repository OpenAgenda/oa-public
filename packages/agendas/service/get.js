"use strict";

const w = require( 'when' ),

  _ = require( 'lodash' ),

  utils = require( 'utils' ),

  details = require( './details' ),

  map = require( './databaseFieldMap' ),

  dbParse = require( 'mysql-utils/mapper' )( map ),

  validate = require( './validate' ),

  sUtils = require( './lib/utils' );

let knex, service, schemas, imagePath;

module.exports = get;
module.exports.init = init;
module.exports.findOne = findOne;

function findOne( search, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  knex( schemas.agenda )

    .select( 'id' )

    .where( 'title', 'like', '%' + search + '%' )

    .limit( 1 )

  .then( rows => {

    if ( !rows.length ) return cb( null, null );

    get( rows[ 0 ].id, options, cb );

  }, cb );

}

function get( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  w( utils.extend( {
    identifiers: sUtils.identifiers.clean( identifiers ),
    detailed: false,
    internal: false,
    instanciate: false,
    includeImagePath: false,
    useDefaultImage: false,
    private: false,
    includeRestricted: false
  }, options, {
    entry: null, 
    data: null,
    filtered: null
  } ) )

  .then( sUtils.identifiers.check )

  .then( _get )

  .then( _transform )

  .then( _detailed )

  .then( _filterInternals )

  .done( v => {

    if ( !v.filtered ) return cb( null, null );

    if ( v.includeImagePath && v.filtered.image ) {

      v.filtered.image = imagePath + v.filtered.image;

    } else if ( v.useDefaultImage && !v.filtered.image )  {

      v.filtered.image = service.getConfig().defaultImagePath;

    }

    cb( null, v.instanciate ? new service.Agenda( v.filtered ) : v.filtered );

  }, cb );


}


/**
 * get db entry based on identifiers
 */
function _get( v ) {

  let k = knex( schemas.agenda )

  .select( dbParse.fields( 'db', v.internal, [ 'id' ] ) )

  .where( v.identifiers );

  if ( v.private !== null ) {

    k.andWhere( 'private', v.private );

  }

  return k.then( rows => {

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


/**
 * in db, values are null when they are not defined.
 * In those cases, default value should apply.
 */

function _applyDefaults( data ) {

  let defaulted = utils.extend( {}, validate.default );

  Object.keys( data ).forEach( k => {

    defaulted[ k ] = _.includes( [ 'null', '{}' ], JSON.stringify( data[ k ] ) ) ? defaulted[ k ] : data[ k ];

  } );

  return defaulted;

}


function _detailed( v ) {

  if ( !v.detailed || !v.data ) return v;

  let d = w.defer();

  details.load( v.data, { includeRestricted: v.includeRestricted }, ( err, data ) => {

    if ( err ) return d.reject( err );

    v.data = data;

    d.resolve( v );

  } );

  return d.promise;

}


function _filterInternals( v ) {

  if ( !v.data ) return v;

  v.filtered = {};

  Object.keys( v.data )
    .filter( f => {

      return v.internal || !dbParse.is( 'obj', f, 'internal' );

    } )
    .forEach( f => {

      v.filtered[ f ] = v.data[ f ];

    } );

  return v;

}


function init( svc, k ) {

  service = svc;

  schemas = service.getConfig().schemas;

  imagePath = service.getConfig().imagePath;

  knex = k;

}