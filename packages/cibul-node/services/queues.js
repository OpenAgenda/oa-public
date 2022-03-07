"use strict";

const redis = require( 'redis' );

const log = require( '@openagenda/logs' )( 'services/queues' );
const Queues = require( '@openagenda/queues' ).v2;

let queues;

module.exports = Object.assign( name => {

  if ( queues ) {
    return queues( name );
  } else {
    log( 'warn', 'queues is not initialized' );
  }

}, { init } );

function init( config ) {
  const logger = config.getLogConfig('svc', 'queues');
  queues = Queues( {
    logger,
    redis: config.redisClient || redis.createClient( config.port, config.host ),
    prefix: 'q:'
  } );

  return queues;
}
