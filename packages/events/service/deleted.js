"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const map = require( './databaseFieldMap' );

const dbParse = require( 'mysql-utils/mapper' )( map );

let schemas, service, knex;

module.exports = Object.assign( deleted, { init } );

function deleted( offset, limit, cb ) {

  if ( !knex ) return cb( 'events service was not initialized' );

  w( {
    offset,
    limit,
    deleted: []
  } )

  .then( _list )

  .done( v => cb( null, v.deleted ), cb )

}


function _list( v ) {

  return knex( schemas.event )

  .select( [ 'uid', 'deleted_at' ] )

  .whereNotNull( 'deleted_at' )

  .limit( v.limit || 0 )

  .offset( v.offset || 0 )

  .orderBy( 'deleted_at', 'desc' )

  .then( rows => {

    v.deleted = rows.map( dbParse.toObj );

    return v;

  } );

}


function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

}