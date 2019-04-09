"use strict";

const _ = require( 'lodash' );

const loadControlData = require( './utils/loadControlData' );
const verifyAndRemoveLocation = require( './utils/verifyAndRemoveLocation' );
const refreshTimestamp = require( './utils/refreshTimestamp' );

const log = require( '@openagenda/logs' )( 'controlData/remove' );

module.exports = async ( { prefix, redis }, agendaEvent ) => {

  const { eventUid, agendaUid } = agendaEvent;

  const ctlData = await loadControlData( redis, prefix, agendaUid );

  const eventIndex = ctlData ? _.findIndex( ctlData.ev, { u: eventUid } ) : -1;

  if ( eventIndex === -1 ) {

    log( 'warn', 'did not find any ref to remove for %j', agendaEvent );

    return null;

  } else {

    verifyAndRemoveLocation( ctlData, eventIndex );

    const eventRef = _.first( ctlData.ev.splice( eventIndex, 1 ) );

    await redis.set( prefix + agendaUid, JSON.stringify( ctlData ) );

    await refreshTimestamp( prefix, redis, agendaUid );

    return eventRef;

  }

}
