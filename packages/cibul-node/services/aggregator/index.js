"use strict";

var config = require( '../../config' ),

notify = require( './lib/notify' ),

evaluate = require( './lib/evaluate' ),

sources = require( './lib/sources' ),

task = require( './lib/task' ),

q = require( 'queue' )( config.queues.aggregator, { 
  redis: config.redis 
} );

module.exports = {
  notifyPublish: notify.publish,
  notifyUnpublish: notify.unpublish,
  sourceAdd: sources.add,
  sourceRemove: sources.remove,
  test: {
    clear: q.test.clear,
    flush: q.test.flush,
    evaluate: evaluate,
    process: sources.process
  },
  task: task
}

notify.set( {
  q: q
} );

sources.set( {
  q: q
} );

task.set( {
  q: q
} );