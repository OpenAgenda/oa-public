"use strict";

const knexLib = require( 'knex' ),

  details = require( './details' ),

  w = require( 'when' ),

  guard = require( 'when/guard' ),

  wn = require( 'when/node' );

var knex,

  config,

  schemas;

module.exports = {
  init,
  list,
  count,
  getConfig: () => config
}

function init( c ) {

  schemas = c.schemas;

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  details.init( schemas, knex );

  config = c;

}


function list( query, offset, limit, cb ) {

  if ( arguments.length === 3 ) {

    cb = limit;
    limit = offset;
    offset = query;
    query = {};

  }

  query = Object.assign( {
    total: false,
    detailled: false,
    search: null
  }, query );

  if ( !knex ) return cb( 'no config' );

  w( {
    offset: offset,
    limit: limit,
    query: query,
    agendas: [],
    total: null,
    knex: knex( schemas.agenda )
  } )

  .then( _search )

  .then( _total )

  .then( _list )

  .then( _detailed )

  .done( v => cb( null, v.agendas, v.total ) );

}

function count( cb ) {

  list( { total: true }, null, null, ( err, agendas, total ) => {
    if ( err ) cb( err );
    cb( null, total );
  } );

}


function _search( v ) {

  if ( !v.query.search ) return v;

  v.knex = v.knex
  .where( 'title', 'like', `%${v.query.search}%` )
  .orWhere( 'description', 'like', `%${v.query.search}%` )
  .orWhere( 'slug', 'like', `%${v.query.search}%` )

  return v;

}

function _total( v ) {

  if ( !v.query.total ) return v;

  return knex.transaction( trx => {

    return v.knex.clone()
    .count( 'id as agendas' )
    .transacting( trx );

  } )

  .then( result => {

    v.total = result[ 0 ].agendas;

    return v;

  } );

}

function _list( v ) {

  return knex.transaction( trx => {

    return v.knex
    .select( 'id', 'uid', 'slug', 'title', 'description', 'image', 'url', 'updated_at' )
    .orderBy( 'updated_at', 'desc' )
    .limit( v.limit || 0 )
    .offset( v.offset || 0 )
    .transacting( trx );

  } )

  .then( agendas => {

    v.agendas = agendas;

    return v;

  } );

}

function _detailed( v ) {

  if ( !v.query.detailed ) return v;

  let gDetails = guard( guard.n( 1 ), agenda => wn.call( details.load, agenda ) );

  return w.map( v.agendas, gDetails )

  .then( agendas => {

    v.agendas = agendas;

    return v;

  } );

}