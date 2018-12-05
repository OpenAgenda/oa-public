"use strict";

const getter = require( './lib/getter' ),

store = require( './lib/store' ),

task = require( './lib/task' ),

utils = require( '@openagenda/utils' ),

config = require( '../../../config' ),

log = require( '@openagenda/logger' )( 'services/agenda/controlData', { lib: 'index' } ),

q = require( '@openagenda/queue' )( config.queues.controlData + ':queue', { redis: config.redis } ),

namespace = 'agendaControlData';

store.init( {
  redis: config.redis,
  namespace
} );

task.init( {
  redis: config.redis,
  queuesNamespace: config.queues.controlData
});

module.exports = getter;

module.exports.task = task;

module.exports.queue = ( agenda, options, cb ) => {

  // agenda is an id, options { type: 'eventUpdate', eventId }

  if ( arguments.length === 2 && typeof options === 'function') {

    cb = options;
    options = {};

  }

  const params = utils.extend( {
    id: typeof agenda == 'object' ? agenda.id : agenda,
    type: false, // 'eventPublish', 'eventRemove', 'reset', 'eventUpdate'
    eventId: false, // if event action, specify event
  }, options );

  log( 'info', utils.extend( { message: 'queueing ctl data job' }, params ) );

  q( params, cb );

}
