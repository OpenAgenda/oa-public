"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const get = require( './get' );

let config, knex;

module.exports = _.extend( remove, { 
  init: ( c, k ) => { config = c; knex = k }
} );

function remove( agendaId, eventId, cb ) {

  if ( !knex ) return cb( 'service not initialized' );

  w( {
    agendaId,
    eventId,
    success: false,
    agendaEvent: null,
    result: null
  } )

  .then( _get )

  .then( _remove )

  .done( v => {

    if ( v.success && config.interfaces && config.interfaces.onRemove ) {

      config.interfaces.onRemove( v.agendaEvent );

    }

    cb( null, {
      success: v.success,
      found: !!v.agendaEvent,
      removed: v.success ? v.agendaEvent : null
    } )

  }, cb );

}

function _get( v ) {

  let { agendaId, eventId } = v;

  let d = w.defer();

  get( agendaId, eventId, ( err, agendaEvent ) => {

    if ( err ) return d.reject( err );

    v.agendaEvent = agendaEvent;

    d.resolve( v );

  } );

  return d.promise;

}

function _remove( v ) {

  let { agendaId, eventId, agendaEvent } = v;

  if ( !agendaEvent ) return v;

  return knex( config.schemas.agendaEvent )

    .del()

    .where( {
      event_id: v.eventId,
      agenda_id: v.agendaId
    } )

  .then( removedRows => {

    v.success = !!removedRows;

    return v;

  } );

}