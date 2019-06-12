"use strict";

const log = require( '@openagenda/logs' )( 'agendaLocations/onCreate' );

const { distance } = require( '@openagenda/agenda-locations' ).utils;

module.exports = async ( { queue }, before, after ) => {

  if ( distance( before, after ) > 10 ) {
    queue( 'reindexImpactedEvents', before, after );
  }

  // if position changed
  // need to find all related events to:
  //
  //  * 1. resync legacy search
  //  * 2. for each related agenda
  //


}
