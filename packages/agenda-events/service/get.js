"use strict";

const _ = require( 'lodash' );

const utils = require( 'utils' );

const w = require( 'when' );

let config, knex;

module.exports = _.extend( get, { 
  init: ( c, k ) => { config = c; knex = k }
} );

function get( agendaId, eventId, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    agendaId,
    eventId
  } )

  .then( _get )

  .done( v => {

    cb( null, v.agendaEvent );

  }, cb );

}


function _get( v ) {

  let { agendaId, eventId } = v;

  return knex( config.schemas.agendaEvent )

    .select( '*' )

    .where( {
      'agenda_id' : agendaId,
      'event_id' : eventId
    } )

    .limit( 1 )

    .then( rows => {

      v.agendaEvent = rows.length ? utils.toCamelCase( rows[ 0 ] ) : null

      return v;

    } );

}