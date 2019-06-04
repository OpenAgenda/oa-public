"use strict";

const _ = require( 'lodash' );

module.exports = async ( knex, table, asyncFn, options = {} ) => {

  const {
    startFromId,
    query,
    field
  } = Object.assign( {
    startFromId: 99999999,
    query: null,
    field: 'id'
  }, options );

  let lastId = startFromId, ids;

  while ( ( ids = await _buildQuery( { knex, table, field, lastId, query } )
    .then( r => r.map( r => r[ field ] ) )
  ).length ) {

    lastId = _.last( ids );

    for ( const id of ids ) {
      await asyncFn( id );
    }

  }

}

function _buildQuery( { knex, table, field, lastId, query } ) {

  const k = knex( table )
    .select( field )
    .where( field, '<', lastId )
    .limit( 100 )
    .orderBy( field, 'desc' );

  if ( query ) k.where( query );

  return k;

}
