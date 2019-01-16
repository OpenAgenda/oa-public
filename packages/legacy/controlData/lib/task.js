"use strict";

const log = require( '@openagenda/logs' )( 'legacy/controlData/queue' );

const promisifyRedis = require( './utils/promisifyRedis' );
const queuables = {
  batch: require( './batch' ),
  batchRemove: require( './batchRemove' ),
  clear: require( './clear' ),
  insert: require( './insert' ),
  memberSet: require( './memberSet' ),
  memberRemove: require( './memberRemove' ),
  update: require( './update' ),
  rebuild: require( './rebuild' ),
  remove: require( './remove' ),
  set: require( './set' )
};

module.exports = async config => {

  const { redis, prefix } = config;

  const taskRedis = promisifyRedis( redis.duplicate() );

  let blPopResult;

  while ( blPopResult = await taskRedis.blpop( prefix + 'queue', 0 ) ) {

    try {

      const {
        operation,
        args
      } = JSON.parse( blPopResult[ 1 ] );

      log( 'processing %s', operation );

      await queuables[ operation ].apply( null, [ config ].concat( args ) );

    } catch ( e ) {

      log( 'error', 'failed to process job %j', blPopResult, e );

    }

  }

}
