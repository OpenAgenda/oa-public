"use strict";

const initializeControlData = require( './initializeControlData' );

const log = require( '@openagenda/logs' )( 'controlData/loadAgendaControlData' );

module.exports = async ( redis, prefix, agendaUid ) => {

  const ctlDataStr = await redis.get( prefix + agendaUid );

  if ( ctlDataStr ) {

    try {

      return JSON.parse( ctlDataStr );

    } catch ( e ) {

      log( 'error', 'could not parse control data of agenda %s: %s', agendaUid, ctlDataStr );

    }

  }

  return initializeControlData();

}
