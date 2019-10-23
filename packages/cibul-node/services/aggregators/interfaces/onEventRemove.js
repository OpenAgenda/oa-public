"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );

const log = require( '@openagenda/logs' )( 'aggregator/onEventRemove' );

module.exports = ( eventUid, sourceUid, aggregatorUid ) => {

  agendaEvents( aggregatorUid ).remove( eventUid, {
    context: {
      agendaUid: sourceUid
    }
  } ).catch( e => {

    log( 'error', e );

  } );

}
