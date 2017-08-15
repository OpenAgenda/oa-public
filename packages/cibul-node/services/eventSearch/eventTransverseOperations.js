"use strict"

const _ = require( 'lodash' );

const logger = require( 'logger' );

const eventSearch = require( 'event-search' );

const agendaEvents = require( 'agenda-events' );

const agendaIndices = require( './agendaIndices' );

const q = require( 'queue' )( 'eventSearch', { redis: require( '../../config' ).redis } );

let log;

module.exports = {
  update,
  init
}

async function update( event, context = {}) {

  // main agenda
  const agendaUid = context.agendaUid;

  if ( agendaUid ) {

    await agendaIndices( { uid: agendaUid } ).update( event.uid );

  }

  // secondary agendas
  ( await agendaEvents.list.byEventUid( event.uid, 0, 1000 ) ).items

    .map( i => i.agendaUid )

    .filter( aUid => aUid !== agendaUid )

    .forEach( _queueUpdate.bind( null, event ) );

}

function _queueUpdate( event, agendaUid ) {

  const args = { agendaUid, eventUid: event.uid };

  log( 'queuing index update for args %s', JSON.stringify( args ) );

  q( { method: 'update', args } );

}

function init( c ) {

  log = logger( 'services/eventSearch/eventTransverseOperations' );

}