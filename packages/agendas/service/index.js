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
  init: init,
  list: list,
  getConfig: () => { return config; }
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

  if ( !knex ) return cb( 'no config' );

  w( {
    offset: offset,
    limit: limit,
    query: query,
    agendas: []
  } )

  .then( _list )

  .then( _detailed )

  .done( v => cb( null, v.agendas ), cb );

}

function _detailed( v ) {

  if ( !v.query.detailed ) {

    return v;

  }

  let gDetails = guard( guard.n( 1 ), agenda => wn.call( details.load, agenda ) );

  return w.map( v.agendas, gDetails )

  .then( agendas => {

    v.agendas = agendas;

    return v;

  } );

}

function _list( v ) {

  return knex.transaction( trx => {

    return trx
    .select( 'id', 'uid', 'slug', 'title', 'description', 'image', 'updated_at' )
    .from( schemas.agenda )
    .limit( v.limit )
    .offset( v.offset );

  } )

  .then( agendas => {

    v.agendas = agendas;

    return v;

  } );

}