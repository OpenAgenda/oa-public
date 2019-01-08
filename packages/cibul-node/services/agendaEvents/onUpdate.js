"use strict";

const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onUpdate' );

const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const fallbackContextGet = require( './lib/fallbackContextGet' );
const queueForControlData = require( './lib/queueForControlData' );
const sendEventUpdate = require( './lib/sendEventUpdate' );
const sendEventChangeState = require( './lib/sendEventChangeState' );

module.exports = async ( before, after, context ) => {

  log( 'updated agenda-event from %j to %j', before, after );

  try {

    await eventSearch.agendas( after.agendaUid ).update( after );

  } catch ( e ) {

    log( 'error', 'could not update event search', e );

  }

  await _sleepALittle(); // legacy search might try to fetch event content before it is committed to db

  const { agenda, event } = await fallbackContextGet( 'onUpdate', after, context );

  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.update',
    values: {
      uid: event.uid,
      type: 'update'
    }
  } );


  if ( after.state === 2 ) {

    queueForControlData( 'agendaEvent.onUpdate', agenda, event );

  } else if ( before.state === 2 ) {

    queueForControlData.remove( 'agendaEvent.onUpdate', agenda, event );

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
      await sendEventUpdate( { agendaEvent: after, before, context, agenda, event } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event update emails' ) );
    }
  } else {
    // eventChangeState
    // myEventChangeState
    try {
      await sendEventChangeState( { agendaEvent: after, before, context, agenda, event } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event change state emails' ) );
    }
  }

}

function _sleepALittle() {

  return new Promise( rs => setTimeout( () => rs(), 2000 ) );

}
