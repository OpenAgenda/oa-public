"use strict";

const _ = require( 'lodash' );
const mysql = require( 'mysql' );

module.exports = {
  update,
  insert
}


function insert( query, table, data, cb ) {

  const rows = _.isArray( data ) ? data : [ data ];

  const fields = Object.keys( rows[ 0 ] );

  const insertQuery = [ 'insert into', table ].concat( [ 
    '(', fields.join( ', ' ), ') values' 
  ] );

  let insertRows;

  insertQuery.push( rows.map( row => {

    return '(' + fields.map( field => _prepareField( row[ field ] ) ).join( ', ' ) + ')';

  } ).join( ', ' ) );

  query( insertQuery.join( ' ' ), [], cb );

}


function update( query, table, wheres, values, cb ) {

  const updateQuery = [];

  const updateParts = [];

  const whereParts = [];

  const filtered = _.extend( {}, values );

  updateQuery.push( [ 'update', table, 'set' ].join(' ') );

  // filter out identifiers from update values
  
  _.keys( wheres ).forEach( ( k ) => {

    delete filtered[ k ];

  } );

  // stick the values to be updated in the update query

  for ( const field in filtered ) {

    updateParts.push( field + '=' + _prepareField( filtered[ field ] ) );

  }

  updateQuery.push( updateParts.join( ',' ) );

  if ( !_.keys( wheres ).length ) {

    return cb( 'update with no wheres defined' );

  }


  // stick the where bit in

  updateQuery.push( 'where' );

  for( const field in wheres ) {

    whereParts.push( field + ' = ' + mysql.escape( wheres[ field ] ) );

  }

  updateQuery.push( whereParts.join( ' and ' ) );

  query( updateQuery.join( ' ' ), [], cb );

}


/**
 * objects must be stringified
 * before they can be shoved in a field
 */

function _prepareField( f ) {

  if ( typeof f == 'object' && !( f instanceof Date ) && ( f !== null ) ) {

    return mysql.escape( JSON.stringify( f ) );

  }

  return mysql.escape( f );

}