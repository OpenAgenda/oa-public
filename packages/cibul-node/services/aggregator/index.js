"use strict";

const queue = require( '@openagenda/queue' );

const config = require( '../../config' );
const evaluate = require( './lib/evaluate' );
const isAggregator = require( './lib/isAggregator' );
const notify = require( './lib/notify' );
const sources = require( './lib/sources' );
const task = require( './lib/task' );

const onError = require( '../00_errors' ).bind( null, 'aggregator' );

const q = queue( config.queues.aggregator, {
  redis: config.redis,
  schedulable: true,
  onError
} );

const pQ = queue( config.queues.aggregator + ':priority', {
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
    evaluate,
    process: sources.process
  },
  task,
  init: config => {

    require( './interfaces/onEventRemove' ).init();

    require( './lib/svc' ).init( {
      knex: config.knex
    } );

  }
}

notify.set( { q, pQ } );

sources.set( { q, pQ } );

task.set( { q, pQ } );