"use strict";

const log = require( '@openagenda/logs' )( 'legacy/controlData/queue' );

const promisifyRedis = require( './utils/promisifyRedis' );
const queuables = {
  set: require( './set' ),
  insert: require( './insert' ),
  update: require( './update' ),
  remove: require( './remove' ),
  batch: require( './batch' ),
  batchRemove: require( './batchRemove' )
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
