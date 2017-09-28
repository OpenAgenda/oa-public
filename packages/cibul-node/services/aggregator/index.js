"use strict";

const config = require( '../../config' ),

  notify = require( './lib/notify' ),

  evaluate = require( './lib/evaluate' ),

  sources = require( './lib/sources' ),

  task = require( './lib/task' ),

  isAggregator = require( './lib/isAggregator' ),

  queue = require( 'queue' ),

  q = queue( config.queues.aggregator, { 
    redis: config.redis,
    schedulable: true
  } ),

  pQ = queue( config.queues.aggregator + ':priority', {
    redis: config.redis,
    schedulable: true
  } );

module.exports = {
  isAggregator,
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
  task: task,
  initless: true
}

notify.set( { q, pQ } );

sources.set( { q, pQ } );

task.set( { q, pQ } );