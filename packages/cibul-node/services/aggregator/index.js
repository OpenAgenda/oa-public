"use strict";

var config = require( '../../config' ),

notify = require( './lib/notify' ),

evaluate = require( './lib/evaluate' ),

sources = require( './lib/sources' ),

task = require( './lib/task' ),

q = require( 'queue' )( config.queues.aggregator, { 
  redis: config.redis,
  schedulable: true
} );

module.exports = {
  notifyPublish: notify.publish,
  notifyUnpublish: notify.unpublish,
  sourceAdd: sources.add,
  sourceRemove: sources.remove,
  test: {
    clear: q.test.clear.bind( null, config.queues.aggregator ),
    flush: q.test.flush,
    evaluate: evaluate,
    process: sources.process
  },
  task: task
}

notify.set( { q } );

sources.set( { q } );

task.set( { q } );