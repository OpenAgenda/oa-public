"use strict";

const _ = require( 'lodash' );

const loadControlData = require( './utils/loadControlData' );
const refreshTimestamp = require( './utils/refreshTimestamp' );
const roles = require( './utils/roles' );

module.exports = async ( { prefix, knex, redis, loadedCtlData, skipSave }, { agendaUid, locationUid } ) => {

  const ctlData = loadedCtlData || await loadControlData( redis, prefix, agendaUid );

  const index = _.findIndex( ctlData.l, { u: locationUid } );

  if ( index === -1 ) return;

  ctlData.l.splice( index, 1 );

  if ( !skipSave ) {

    await redis.set( prefix + agendaUid, JSON.stringify( ctlData ) );

    await refreshTimestamp( prefix, redis, agendaUid );

  }

}
