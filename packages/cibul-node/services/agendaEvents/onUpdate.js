"use strict";

const wn = require( 'when/node' );

const agendasSvc = require( '@openagenda/agendas' );
const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onUpdate' );
const oldEventSvc = require( '../event' );

module.exports = async ( before, after, context ) => {

  log( 'updated agenda-event from %j to %j', before, after, { context } );

  try {

    await eventSearch.agendas( after.agendaUid ).update( after );

  } catch ( e ) {

    log( 'error', 'could not update event search', e );

  }

  const agenda = await wn.call( agendasSvc.get, { uid: after.agendaUid }, { internal: true, private: null } );

  const event = await wn.call( oldEventSvc.get, { uid: after.eventUid, reviewId: agenda.id } );

  await _sleepALittle(); // legacy search might try to fetch event content before it is committed to db

  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.update',
    values: {
      id: event.id,
      type: 'update'
    }
  } );

  
  if ( context.legacy ) return;

  if ( before.state === after.state ) return;

  if ( after.state === 2 ) {

    aggregator.notifyPublish( event.id, agenda.id );

  } else if ( before.state === 2 ) {

    aggregator.notifyUnpublish( event.id, agenda.id );

  }

}

function _sleepALittle() {

  return new Promise( rs => setTimeout( () => rs(), 1000 ) );

}