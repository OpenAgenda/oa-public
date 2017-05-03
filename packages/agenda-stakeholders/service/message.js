"use strict";

const logger = require( 'basic-logger' ),

  async = require( 'async' ),

  queue = require( 'queue' ),

  list = require( './list' ),

  get = require( './get' ),

  _ = require( 'lodash' );

module.exports = _.extend( queueMessage, {
  task,
  init
} );

let q, queueConfig, log, interfaces;


/**
 * queue message content and recipients query
 */
function queueMessage( base, query, message, context, cb ) {

  log( 'queuing message %s', message );

  q( { 
    type: 'list',
    base,
    query,
    message,
    context
  }, err => {

    log( 'queued message %s', message );

    if ( err ) return cb( err );

    cb( null, {
      queued: true
    } );

  } );

}

/**
 * retrieve stakeholders targeted by query
 * and for each stakeholder queue message
 * process job.
 */
function listAndQueueStakeholders( { query, message, base, context }, cb ) {

  const limit = 20; // why not.

  let hasMore = true, offset = 0;

  async.whilst( () => hasMore, wcb => {

    list( base, query, offset, limit, ( err, stakeholders ) => {

      if ( err ) return wcb( err );

      if ( !stakeholders.length ) {

        hasMore = false;

        return wcb();

      }

      offset += limit;

      async.eachSeries( stakeholders, ( stakeholder, ecb ) => {

        q( { type: 'item', stakeholder, message, context }, ecb );

      }, wcb );

    } );

  }, cb );

}

function processSingleMessage( { stakeholder, message, context }, cb ) {

  interfaces.onMessage( stakeholder, message, context, cb );

}


function task() {

  q.setConsumer( ( data, cb ) => {

    ( data.type === 'list' ? listAndQueueStakeholders : processSingleMessage )( data, cb );

  } );

  q.launch();

  return {
    shutdown: q.shutdown
  }

}


function init( config ) {

  log = logger( 'message' );

  log( 'initing' );

  queueConfig = config.queue;

  interfaces = config.interfaces;

  q = queue( queueConfig.names.message, { redis: queueConfig.redis } );

}