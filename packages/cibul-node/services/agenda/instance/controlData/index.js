"use strict";

var getter = require( './lib/getter' ),

store = require( './lib/store' ),

task = require( './lib/task' ),

config = require( '../../../../config' ),

log = require( 'logger' )( 'controlData', { lib: 'index' } ),

q = require( 'queue' )( config.queues.controlData, { redis: config.redis } );

store.init( {
  redis: config.redis,
  namespace: 'agendaControlData'
} );

task.init( {
  queue: q
});

module.exports = getter;

module.exports.task = task;

module.exports.queue = function( agenda, cb ) {

  var agendaId = typeof agenda == 'object' ? agenda.id : agenda;

  log( 'queuing ctl data process for agenda %s', agendaId );

  q( { id: agendaId }, cb );

}