"use strict";

const agendaEventsSvc = require( '@openagenda/agenda-events' );
const agendaEventsRemove = require( '@openagenda/agenda-events/service/remove' );
const log = require( '@openagenda/logs' )( 'events/interfaces/beforeRemove' );

module.exports = async ( event, context, cb ) => {

  log( 'will remove event %s', event.uid, { context } );

  let hasMore;

  try {

    do {

      const { items: agendaEvents } = await agendaEventsSvc.list.byEventUid( event.uid, 0, 20 );

      for ( const agendaEvent of agendaEvents ) {

        await agendaEventsRemove(
          agendaEvent.agendaUid,
          agendaEvent.eventUid,
          { context: { ...context, deletion: true } }
        );

      }

      hasMore = agendaEvents.length

    } while ( hasMore );

  } catch( e ) {

    log( 'error', 'failed to remove all agenda event references for event uid %s, error: %s', event.uid, e );

  }

  cb();

}
