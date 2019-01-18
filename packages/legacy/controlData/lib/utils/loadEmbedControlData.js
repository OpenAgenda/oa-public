"use strict";

const promisifyRedis = require( './promisifyRedis' );
const buildEmbedControlData = require( './buildEmbedControlData' );

module.exports = async ( { prefix, knex, redis, imagePath }, embedUid ) => {

  const pRedis = promisifyRedis( redis );

  let ctlDataStr = await pRedis.get( prefix + 'embeds:' + embedUid );

  if ( ctlDataStr ) return ctlDataStr;

  const embedControlData = await buildEmbedControlData( { knex, imagePath }, embedUid );

  const stringified = JSON.stringify( embedControlData );

  await pRedis.set( prefix + 'embeds:' + embedUid, stringified );

  return stringified;

}
