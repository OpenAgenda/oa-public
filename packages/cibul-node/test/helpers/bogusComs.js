// fake coms module for testing

var debug = require( 'debug' ),

log = debug('bogusComs'),

bogusQueues = {},

bogusChannels = {};

exports.queue = function( queueName, values, cb ) {

  log( 'fake queuing on %s', queueName );

  if ( !bogusQueues[queueName] ) bogusQueues[queueName] = [];

  bogusQueues[ queueName ].push( JSON.stringify( values ));

  cb();

}

exports.consume = function( queueName, cb ) {

  if ( !bogusQueues[queueName] || !bogusQueues[queueName].length ) return cb( 'nothing was bogus queued' );

  cb( null, bogusQueues[queueName].shift() );

}

exports.subscribe = function( channelName, cb ) {

  log( 'bogus subscribing to channel %s', channelName );

  if ( !bogusChannels[channelName] ) bogusChannels[ channelName ] = [];

  bogusChannels[ channelName ].push( cb );

}

exports.publish = function( channelName, values ) {

  log( 'bogus publishing on channel %s', channelName );

  // just throw values to callbacks.

  if ( !bogusChannels[ channelName ] ) {

    log( 'publishing on channel where no one is listening: "%s"', channelName );

    return;

  }

  bogusChannels[ channelName ].forEach( function( cb ) {

    cb( null, values );

  });

}