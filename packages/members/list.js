"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const addListFilters = require( './lib/addListFilters' );
const cleanDbEntry = require( './lib/cleanDbEntry' );

module.exports = async function( { knex, schema }, query, from, limit = 20 ) {

  const k = knex( schema )
    .limit( limit )
    .orderBy( 'id', 'desc' );

  addListFilters( k, query, from );

  if ( from ) k.where( 'id', '<', from );

  return k.then( rows => rows.map( cleanDbEntry ) );

}
