"use strict";

const log = require( '@openagenda/logs' )( 'agendaLocations/onCreate' );

const { distance } = require( '@openagenda/agenda-locations' ).utils;

module.exports = async ( { queue }, before, after ) => {

  if ( distance( before, after ) > 10 ) {
    queue( 'syncImpactedEventsAndAgendas', before, after );
  }

}
