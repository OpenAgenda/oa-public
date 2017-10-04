"use strict";

const config = require( '../../config' ),

  onError = require( '../00_errors' ).bind( null, 'aggregator' ),

  notify = require( './lib/notify' ),

  evaluate = require( './lib/evaluate' ),

  sources = require( './lib/sources' ),

  task = require( './lib/task' ),

  isAggregator = require( './lib/isAggregator' ),

  queue = require( 'queue' ),

  q = queue( config.queues.aggregator, { 
    redis: config.redis,
    schedulable: true,
    onError
  } ),

  pQ = queue( config.queues.aggregator + ':priority', {
    redis: config.redis,
    schedulable: true,
    onError
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
  init: config => {

    require( './interfaces/onEventRemove' ).init();

  }
}

notify.set( { q, pQ } );

sources.set( { q, pQ } );

task.set( { q, pQ } );