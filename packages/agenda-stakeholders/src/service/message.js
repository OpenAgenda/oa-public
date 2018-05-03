"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );

const logger = require( '@openagenda/basic-logger' );
const queue = require( '@openagenda/queue' );

const contextValidator = require( '../iso/contextValidator' );
const get = require( './get' );
const list = require( './list' );

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

  let cleanContext;

  try {

    cleanContext = contextValidator( context );

  } catch ( errs ) {

    return cb( errs );

  }

  q( { 
    type: 'list',
    base,
    query,
    message,
    context: cleanContext
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