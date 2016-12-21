"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const utils = require( 'utils' );

let config, knex;

module.exports = _.extend( list, { 
  init: ( c, k ) => { config = c; knex = k }
} );

function list( agendaId, offset, limit, cb ) {

  if ( !knex ) return cb( 'service not initialized' );

  w( {
    agendaId,
    offset,
    limit,
    items: [],
    total: null
  } )

  .then( _total )

  .then( _list )

  .done( v => {

    cb( null, v.items, v.total );

  }, cb );

}

function _total( v ) {

  return knex( config.schemas.agendaEvent )

    .where( 'agenda_id', v.agendaId )

    .count( 'id' )

    .then( rows => {

      v.total = rows[ 0 ][ 'count(`id`)' ];

      return v;

    } );

}

function _list( v ) {

  return knex( config.schemas.agendaEvent )

    .select( '*' )

    .where( 'agenda_id', v.agendaId )

    .limit( v.limit )

    .offset( v.offset )

  .then( rows => {

    v.items = rows.map( utils.toCamelCase );

    return v;

  } );

}