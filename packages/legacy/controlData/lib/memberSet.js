"use strict";

const _ = require( 'lodash' );

const loadControlData = require( './utils/loadControlData' );
const memberRemove = require( './memberRemove' );
const refreshTimestamp = require( './utils/refreshTimestamp' );
const roles = require( './utils/roles' );

module.exports = async ( { prefix, knex, redis }, { agendaUid, userUid, role } ) => {

  const ctlData = await loadControlData( redis, prefix, agendaUid );

  await memberRemove( { prefix, knex, redis, loadedCtlData: ctlData, skipSave: true }, { agendaUid, userUid } );

  _.set(
    ctlData,
    roles[ role ],
    _.get( ctlData, roles[ role ], [] ).concat( userUid )
  );

  await redis.set( prefix + agendaUid, JSON.stringify( ctlData ) );

  await refreshTimestamp( prefix, redis, agendaUid );

}
