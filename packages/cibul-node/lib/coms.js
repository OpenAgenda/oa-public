"use strict";

/**
 * handles communication between application modules through stacked workflows and publish / subscribe
 * difference between stacks and publish / subscribe is that stacks persist the publish ( )
 */

module.exports = {
  queue: queue,                             // (name, values, cb) queue message - used for mailer only for no
  consume: consume,                         // (name, cb) consume queue - not really used
  persistentConsume: persistentConsume,     // (name, cb) keep on consuming queue until its empty, then wait till it fills to keep on consuming - used by mailer
  publish: publish,                         // (name, values) publish message on channel
  subscribe: subscribe,
  end: end,                                 // (name, cb) subscribe to channel messages
  clearQueue: clearQueue                    // (name, cb) clears the queue
}

const log = require( '@openagenda/logs' )( 'coms' );

var redis = require( 'redis' ),

config = require( '../config' ).redis,

qPrefix = 'queues',

logStacksPrefix = 'logstacks',

consumers = {},

sp = ':';


function queue( queueName, values, options, cb ) {

  var cli = redis.createClient( config.port, config.host );

  if ( typeof options == 'function' ) {

    cb = options;

    options = {};

  }

  if ( !options ) options = {};

  var encodedValues = options.raw ? values : JSON.stringify( values ),

  queueName = options.raw ? queueName : qPrefix + sp + queueName;

  log( 'queuing on: %s values: %s', queueName, encodedValues );

  cli.rpush( queueName, encodedValues, function( err ) {

    cli.quit();

    if ( cb ) cb( err );

  });

};


/**
 * consume what is on queue. There can only be one consumer for each queue
 **/

function consume( queueName, nonBlocking, cb ) {

  if ( !cb ) {

    cb = nonBlocking;

    nonBlocking = false;

  }

  var cli = redis.createClient( config.port, config.host );

  if ( nonBlocking ) {

    cli.lpop( qPrefix + sp + queueName, onReceive );

  } else {

    cli.blpop( qPrefix + sp + queueName, 0, onReceive );

  }

  return cli;
  
  function onReceive( err, data ) {

    cli.quit();

    if ( err ) return cb( err );

    var decodedData = JSON.parse( nonBlocking ? data : data[ 1 ] );

    cb( null, decodedData );

  }

}


function end( cli ) {

  if ( cli ) cli.end();

}


function publish( channelName, values ) {

  var stringified = JSON.stringify( values ),

  cli = redis.createClient( config.port, config.host );

  log( 'publishing on: %s values: %s', channelName, stringified );

  cli.publish( channelName, stringified );

  cli.quit();

}


function subscribe( channelName, cb ) {

  log( 'subscribing to: %s', channelName );

  var cli = redis.createClient( config.port, config.host );

  cli.on( 'message' , function( channel, values ) {

    var parsedMessage;

    try {

      parsedMessage = JSON.parse( values );

    } catch( e ) {

      log( 'error', 'subscribe receive: Invalid JSON: %s', values );

    }

    if ( parsedMessage ) {

      cb( null, parsedMessage );

    }

  });

  cli.subscribe( channelName );

  return cli;

}

function clearQueue( queueName, cb ) {

  log( 'clearing queue: %s', queueName );

  var cli = redis.createClient( config.port, config.host );

  cli.del( qPrefix + sp + queueName, function( err ) {

    cli.quit();

    if ( err ) return cb( err );

    cb();

  } )

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
