"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'controlData/settags' );

const loadControlData = require( './utils/loadControlData' );
const refreshTimestamp = require( './utils/refreshTimestamp' );
const setTags = require( './utils/setTags' );

module.exports = async ( { prefix, knex, redis }, agendaUid ) => {

  const agendaId = _.get( await knex( 'review' ).first( 'id' ).where( 'uid', agendaUid ), 'id' );

  if ( !agendaId ) return log( 'no agenda was found for uid %s', agendaUid );

  const ctlData = await loadControlData( redis, prefix, agendaUid, { initialize: true } );

  await setTags( ctlData, knex, agendaId );

  await redis.set( prefix + agendaUid, JSON.stringify( ctlData ) );

  await refreshTimestamp( prefix, redis, agendaUid );

}
