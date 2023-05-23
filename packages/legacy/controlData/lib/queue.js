"use strict";

const log = require( '@openagenda/logs' )( 'legacy/controlData/queue' );

module.exports = ( { redis, prefix }, operation, args = [] ) => {

  log( 'queueing %s', operation );

  return redis.rPush( prefix + 'queue', JSON.stringify( {
    operation,
    args
  } ) );

}
