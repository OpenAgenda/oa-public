// fake coms module

var debug = require( 'debug' ),

log = debug('bogusComs'),

bogusQueues = {};

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