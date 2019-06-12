"use strict";

const _ = require( 'lodash' );

const loadControlData = require( './utils/loadControlData' );

const refreshTimestamp = require( './utils/refreshTimestamp' );
const setLocationReference = require( './utils/setLocationReference' );

module.exports = async ( { prefix, knex, redis }, { agendaUid, location } ) => {

  const ctlData = await loadControlData( redis, prefix, agendaUid );

  setLocationReference( ctlData, location );

  await redis.set( prefix + agendaUid, JSON.stringify( ctlData ) );

  await refreshTimestamp( prefix, redis, agendaUid );

}
