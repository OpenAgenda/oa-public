"use strict";

var utils = require( '@openagenda/utils' );

module.exports = {
  update: update,
  insert: insert
}


function insert( con, table, data, cb ) {

  var fields,

  insertQuery = [ 'insert into', table ], insertRows,

  rows = utils.isArray( data ) ? data : [ data ];

  fields = Object.keys( rows[ 0 ] );

  insertQuery = insertQuery.concat( [ 
    '(', fields.join( ', ' ), ') values' 
  ] );

  insertQuery.push( rows.map( ( row ) => {

    return '(' + fields.map( field => _prepareField( con, row[ field ] ) ).join( ', ' ) + ')';

  } ).join( ', ' ) );

  con.query( insertQuery.join( ' ' ), cb );

}


function update( con, table, wheres, values, cb ) {

  let updateQuery = [],

  updateParts = [], 

  whereParts = [],

  field,

  filtered = utils.extend( {}, values );

  updateQuery.push( ['update', table, 'set'].join(' ') );

  // filter out identifiers from update values
  
  Object.keys( wheres ).forEach( ( k ) => {

    delete filtered[ k ];

  } );

  // stick the values to be updated in the update query

  for ( field in filtered ) {

    updateParts.push( field + '=' + _prepareField( con, filtered[ field ] ) );

  }

  updateQuery.push( updateParts.join( ',' ) );

  if ( !utils.size( wheres ) ) {

    return cb( 'update with no wheres defined' );

  }


  // stick the where bit in

  updateQuery.push( 'where' );

  for( field in wheres ) {

    whereParts.push( field + ' = ' + con.escape( wheres[ field ] ) );

  }

  updateQuery.push( whereParts.join( ' and ' ) );

  con.query( updateQuery.join(' '), cb );

}


/**
 * objects must be stringified
 * before they can be shoved in a field
 */

function _prepareField( con, f ) {

  if ( typeof f == 'object' && !( f instanceof Date ) && ( f !== null ) ) {

    return con.escape( JSON.stringify( f ) );

  }

  return con.escape( f );

}