"use strict";

const log = require( '@openagenda/logs' )( 'events/interfaces/beforeRemove' );

const legacyEventSearch = require( '../elasticsearch' );

module.exports = async (services, event, context) => {
  const {
    agendaEvents: agendaEventsSvc
  } = services;

  log( 'will remove event %s', event.uid, { context } );

  try {
    await legacyEventSearch.removeEvent( { uid: event.uid } );
  } catch ( e ) {
    log( 'error', 'could not update legacy search for event %s', event.uid, e );
  }

  let hasMore;

  try {

    do {

      const { items: agendaEvents } = await agendaEventsSvc.list.byEventUid( event.uid, 0, 20 );

      for ( const agendaEvent of agendaEvents ) {
        await agendaEventsSvc(agendaEvent.agendaUid).remove(agendaEvent.eventUid, { context: { ...context, deletion: true } });
      }

      hasMore = agendaEvents.length

    } while ( hasMore );

  } catch( e ) {

    log( 'error', 'failed to remove all agenda event references for event uid %s, error: %s', event.uid, e );

  }

}
