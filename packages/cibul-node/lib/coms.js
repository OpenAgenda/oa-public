/**
 * handles communication between application modules through stacked workflows and publish / subscribe
 * difference between stacks and publish / subscribe is that stacks persist the publish ( )
 */

exports.queue = queue;                            // (name, values, cb) queue message - used for mailer only for no
exports.consume = consume;                        // (name, cb) consume queue - not really used
exports.persistentConsume = persistentConsume;    // (name, cb) keep on consuming queue until its empty, then wait till it fills to keep on consuming - used by mailer
exports.publish = publish;                        // (name, values) publish message on channel
exports.subscribe = subscribe;                    // (name, cb) subscribe to channel messages
exports.end = end;


var redis = require( 'redis' ),

config = require( '../config' ).redis,

log = require( './logger' )('coms'),

redisCli = redis.createClient( config.port, config.host ),

qPrefix = 'queues',

logStacksPrefix = 'logstacks',

sp = ':';


function queue( queueName, values, cb ) {

  log('queueing on: %s', queueName);

  var encodedValues = JSON.stringify( values );

  redisCli.lpush( qPrefix + sp + queueName, encodedValues, function( err ) {

    if ( cb ) cb( err );

  });

};


function consume( queueName, cb ) {

  log('consuming on: %s', queueName);

  var cli = redis.createClient( config.port, config.host );

  cli.blpop( qPrefix + sp + queueName, 0, function( err, data ) {

    cli.quit();

    if ( err ) return cb( err );

    var decodedData = JSON.parse( data[1] ); // first element is name of queue

    cb( null, decodedData );

  });

}


function end( cli ) {

  if ( cli ) cli.end();

}


function publish( channelName, values ) {

  log( 'publishing on: %s', channelName );

  var cli = redis.createClient( config.port, config.host );

  cli.publish( channelName, JSON.stringify( values ) );

  cli.quit();

}


function subscribe( channelName, cb ) {

  log( 'subscribing to: %s', channelName );

  var cli = redis.createClient( config.port, config.host );

  cli.on( 'message' , function( channel, values ) {

    cb( null, JSON.parse( values ) );

  });

  cli.subscribe( channelName );

}

function persistentConsume( queueName, cb, cli ) {

  if ( !cli ) cli = redis.createClient( config.port, config.host );

  cli.blpop( qPrefix + sp + queueName, 0, function( err, data ) {

    if ( err ) return cb( err );

    var decodedData = JSON.parse( data[1] ); // first element is name of queue

    cb( null, decodedData );

    persistentConsume( queueName, cb, cli ); 

  });

}