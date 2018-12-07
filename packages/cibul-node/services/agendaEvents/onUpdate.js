"use strict";

const VError = require( 'verror' );
const agendasSvc = require( '@openagenda/agendas' );
const eventsSvc = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onUpdate' );

const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const queueForControlData = require( './queueForControlData' );
const sendEventUpdate = require( './sendEventUpdate' );
const sendEventChangeState = require( './sendEventChangeState' );

module.exports = async ( before, after, context ) => {

  log( 'updated agenda-event from %j to %j', before, after, { context } );

  try {

    await eventSearch.agendas( after.agendaUid ).update( after );

  } catch ( e ) {

    log( 'error', 'could not update event search', e );

  }

  await _sleepALittle(); // legacy search might try to fetch event content before it is committed to db

  // Note pour Kaoré, producteur de bugs: J'ai attendu mon contexte toute la journée,
  // j'ai fini par me débrouiller seul comme un (presque) grand
  const agenda = await agendasSvc.get( { uid: after.agendaUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  } );
  const event = await eventsSvc.get( { uid: after.eventUid }, { private: null, deleted: null, internal: true } );

  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.update',
    values: {
      id: event.id,
      type: 'update'
    }
  } );


  if ( after.state === 2 ) {

    queueForControlData( 'agendaEvent.onUpdate', { agenda, event }, context );

  } else if ( agenda && event ) {

    queueForControlData.remove( 'agendaEvent.onUpdate', { agenda, event }, context );

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
      log.error( new VError( error, 'Cannot send event update emails' ) )
    }
  } else {
    // eventChangeState
    // myEventChangeState
    try {
      await sendEventChangeState( { agendaEvent: after, before, context, agenda, event } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event change state emails' ) )
    }
  }

}

function _sleepALittle() {

  return new Promise( rs => setTimeout( () => rs(), 2000 ) );

}
