"use strict";

const log = require( '@openagenda/logs' )( 'agendaLocations/onUpdate' );

const { distance } = require( '@openagenda/agenda-locations' ).utils;

module.exports = async ( { queue }, before, after ) => {

  try {
    if ( distance( before, after ) > 10 ) {
      queue( 'syncImpactedEventsAndAgendas', before, after );
    }
  } catch ( e ) {
    log( 'error', 'failed to evaluate distance', e );
  }

}
