"use strict";

const wn = require( 'when/node' );

const agendasSvc = require( '@openagenda/agendas' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onUpdate' );

const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const oldEventSvc = require( '../event' );
const sendEventUpdate = require( './sendEventUpdate' );
const sendEventChangeState = require( './sendEventChangeState' );

const controlData = require( '../agenda/controlData' );

module.exports = async ( before, after, context ) => {

  log( 'updated agenda-event from %j to %j', before, after, { context } );

  try {

    await eventSearch.agendas( after.agendaUid ).update( after );

  } catch ( e ) {

    log( 'error', 'could not update event search', e );

  }

  await _sleepALittle(); // legacy search might try to fetch event content before it is committed to db

  const agenda = await wn.call( agendasSvc.get, { uid: after.agendaUid }, { internal: true, private: null } );

  const event = await wn.call( oldEventSvc.get, { uid: after.eventUid, reviewId: agenda.id } );

  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.update',
    values: {
      id: event.id,
      type: 'update'
    }
  } );


  if ( after.state === 2 && agenda && event ) {

    controlData.queue( agenda.id, {
      type: 'eventUpdate',
      eventId: event.id
    } );

  } else if ( agenda && event ) {

    controlData.queue( agenda.id, {
      type: 'eventRemove',
      eventId: event.id
    } );

  }

  if ( before.state === after.state ) {

    // currently for logging only. Not used yet for actual aggregation
    aggregator.notify( 'update', {
      event,
      agendaEvent: after,
      agenda
    } );

  } else if ( after.state === 2 ) {

    if ( !context.legacy ) aggregator.notifyPublish( event.id, agenda.id );

    // currently for logging only. Not used yet for actual aggregation
    aggregator.notify( 'update', {
      event,
      agendaEvent: after,
      agenda
    } );

  } else if ( before.state === 2 ) {

    if ( !context.legacy ) aggregator.notifyUnpublish( event.id, agenda.id );

    // currently for logging only. Not used yet for actual aggregation
    aggregator.notify( 'remove', {
      event,
      agendaEvent: after,
      agenda
    } );

  }

  // Send emails
  if ( before.state === after.state ) {
    // eventUpdate
    // myEventUpdate
    try {
      await sendEventUpdate( { agenda, event, agendaEvent: after, before } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event update emails' ) )
    }
  } else {
    // eventChangeState
    // myEventChangeState
    try {
      await sendEventChangeState( { agenda, event, agendaEvent: after, before } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event change state emails' ) )
    }
  }

}

function _sleepALittle() {

  return new Promise( rs => setTimeout( () => rs(), 2000 ) );

}
