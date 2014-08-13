/**
 * handles communication between application modules through stacked workflows and publish / subscribe
 * difference between stacks and publish / subscribe is that stacks persist the publish ( )
 */

var redis = require('redis'),

log = require( 'debug' )('coms');

module.exports = function( config ) {

  redisConfig = config.redis;

  redisCli = redis.createClient(config.redis.port, config.redis.host);

  return {
    queue: queue,
    consume: consume,
    persistentConsume: persistentConsume
  };

};

var redisCli,  // redis client

qPrefix = 'queues',

redisConfig,

queue = function( queueName, values, cb ) {

  log('queueing on: %s', queueName);

  var encodedValues = JSON.stringify( values );

  redisCli.lpush( qPrefix + ':' + queueName, encodedValues, cb);

},

consume = function( queueName, cb ) {

  log('consuming on: %s', queueName);

  cli = redis.createClient( redisConfig.port, redisConfig.host );

  cli.blpop( qPrefix + ':' + queueName, 0, function( err, data ) {

    cli.quit();

    if ( err ) return cb( err );

    var decodedData = JSON.parse( data[1] ); // first element is name of queue

    cb( null, decodedData );

  });

},

persistentConsume = function persistentConsume( queueName, cb, cli ) {

  if ( !cli ) cli = redis.createClient( redisConfig.port, redisConfig.host );

  cli.blpop( qPrefix + ':' + queueName, 0, function( err, data ) {

    if ( err ) return cb( err );

    var decodedData = JSON.parse( data[1] ); // first element is name of queue

    cb( null, decodedData );

    persistentConsume( queueName, cb, cli ); 

  });

};