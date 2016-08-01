"use strict";

const w = require( 'when' ),

utils = require( 'utils' ),

details = require( './details' ),

dbParse = require( './lib/mysqlParse' )( require( './validate' ).map );

let knex, schemas;

module.exports = get;
module.exports.init = init;

function get( identifiers, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  w( utils.extend( {
    identifiers: _cleanIdentifiers( identifiers ),
    detailed: false,
    internal: false
  }, options, {
    entry: null, 
    data: null,
    filtered: null
  } ) )

  .then( _checkIdentifiers )

  .then( _get )

  .then( _translate )

  .then( _detailed )

  .then( _filterInternals )

  .done( v => {

    cb( null, v.filtered );

  }, cb );


}


/**
 * do not proceed if clean identifiers amount to nothing
 */
function _checkIdentifiers( v ) {

  if ( !Object.keys( v.identifiers ).length ) {

    throw 'No known identifiers specified for get';

  }

  return v;

}


/**
 * allow only certain fields for get ( id, uid and slug )
 */
function _cleanIdentifiers( identifiers ) {

  let clean = {};

  if ( typeof identifiers !== 'object' ) {
    
    return {
      id: identifiers
    }

  }

  [ 'id', 'uid', 'slug' ].forEach( field => {

    if ( typeof identifiers[ field ] === 'undefined' ) return;

    clean[ field ] = identifiers[ field ];

  } );

  return clean;

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

  return v;

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


function init( s, k ) {

  schemas = s;

  knex = k;

}