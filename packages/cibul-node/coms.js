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
    queue: queue,                            // queue message - used for mailer only for now
    consume: consume,                        // consume queue - not really used
    persistentConsume: persistentConsume,    // keep on consuming queue until its empty, then wait till it fills to keep on consuming - used by mailer
    publish: publish,                        // publish message on channel
    subscribe: subscribe                     // subscribe to channel messages
  };

};

var redisCli,  // redis client

qPrefix = 'queues',

logStacksPrefix = 'logstacks',

sp = ':',

redisConfig,

queue = function( queueName, values, cb ) {

  log('queueing on: %s', queueName);

  var encodedValues = JSON.stringify( values );

  redisCli.lpush( qPrefix + sp + queueName, encodedValues, cb);

},


consume = function( queueName, cb ) {

  log('consuming on: %s', queueName);

  var cli = redis.createClient( redisConfig.port, redisConfig.host );

  cli.blpop( qPrefix + sp + queueName, 0, function( err, data ) {

    cli.quit();

    if ( err ) return cb( err );

    var decodedData = JSON.parse( data[1] ); // first element is name of queue

    cb( null, decodedData );

  });



},


publish = function( channelName, values ) {

  log( 'publishing on: %s', channelName );

  var cli = redis.createClient( redisConfig.port, redisConfig.host );

  cli.publish( channelName, JSON.stringify( values ) );

  cli.quit();

  logStack( channelName, values );

},


subscribe = function( channelName, cb ) {

  log( 'subscribing to: %s', channelName );

  var cli = redis.createClient( redisConfig.port, redisConfig.host );

  cli.on( 'message' , function( channel, values ) {

    cb( null, JSON.parse( values ) );

  });

  cli.subscribe( channelName );

},

persistentConsume = function persistentConsume( queueName, cb, cli ) {

  if ( !cli ) cli = redis.createClient( redisConfig.port, redisConfig.host );

  cli.blpop( qPrefix + sp + queueName, 0, function( err, data ) {

    if ( err ) return cb( err );

    var decodedData = JSON.parse( data[1] ); // first element is name of queue

    cb( null, decodedData );

    persistentConsume( queueName, cb, cli ); 

  });

},


logStack = function( stackName, values ) {

  var cli = redis.createClient( redisConfig.port, redisConfig.host );

  values._timestamp = new Date();

  cli.lpush( logStacksPrefix + sp + stackName, JSON.stringify( values ) );

  // after a while, dump log stack in a file

};