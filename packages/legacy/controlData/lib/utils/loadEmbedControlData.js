"use strict";

const promisifyRedis = require( './promisifyRedis' );
const buildEmbedControlData = require( './buildEmbedControlData' );

const log = require( '@openagenda/logs' )( 'controlData/loadEmbedControlData' );

module.exports = async ( { prefix, knex, redis, imagePath }, embedUid ) => {

  const pRedis = promisifyRedis( redis );

  let ctlDataStr = await pRedis.get( prefix + 'embeds:' + embedUid );

  if ( ctlDataStr ) {

    log( 'providing embed %s stored data', embedUid );

    return ctlDataStr;

  }

  log( 'building embed %s data', embedUid );

  const embedControlData = await buildEmbedControlData( { knex, imagePath }, embedUid );

  const stringified = JSON.stringify( embedControlData );

  await pRedis.set( prefix + 'embeds:' + embedUid, stringified );

  return stringified;

}
