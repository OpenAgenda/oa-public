"use strict";

const w = require( 'when' ),

utils = require( 'utils' ),

details = require( './details' ),

dbParse = require( './lib/mysqlParse' )( require( './validate' ).map ),

validate = require( './validate' ),

sUtils = require( './lib/utils' );

let knex, service, schemas, imagePath;

module.exports = get;
module.exports.init = init;

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
    includeImagePath: false
  }, options, {
    entry: null, 
    data: null,
    filtered: null
  } ) )

  .then( sUtils.identifiers.check )

  .then( _get )

  .then( _translate )

  .then( _detailed )

  .then( _filterInternals )

  .done( v => {

    if ( !v.filtered ) return cb( null, null );

    if ( v.includeImagePath && v.filtered.image ) {

      v.filtered.image = imagePath + v.filtered.image;

    }

    cb( null, v.instanciate ? service.instanciate( v.filtered ) : v.filtered );

  }, cb );


}


/**
 * get db entry based on identifiers
 */
function _get( v ) {

  return knex( schemas.agenda )

  .select( dbParse.fields( 'db', v.internal, [ 'id' ] ) )

  .where( v.identifiers )

  .then( rows => {

    if ( !rows.length ) return v;

    v.entry = rows[ 0 ];

    return v;

  } );

}


function _translate( v ) {

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

    defaulted[ k ] = data[ k ] === null ? defaulted[ k ] : data[ k ];

  } );

  return defaulted;

}


function _detailed( v ) {

  if ( !v.detailed || !v.data ) return v;

  let d = w.defer();

  details.load( v.data, ( err, data ) => {

    if ( err ) return d.reject( err );

    v.data = data;

    d.resolve( v );

  } );

  return d.promise;

}


function _filterInternals( v ) {

  if ( !v.data ) return v;

  v.filtered = {};

  Object.keys( v.data ).filter( f => v.internal || !dbParse.isInternal( 'obj', f ) ).forEach( f => {

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