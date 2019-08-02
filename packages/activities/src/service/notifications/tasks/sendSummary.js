"use strict";

const log = require( '@openagenda/logs' )( 'activities/notifications/tasks/sendSummary' );
const queue = require( '@openagenda/queue' );

require( 'moment/locale/fr' );

let config;
let knex;
let service;
let q;

module.exports = Object.assign( sendSummary, { init, task } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  q = queue( config.queue.names.sendSummary, { redis: config.queue.redis } );

}

async function task() {

  let summary;

  while ( summary = await q.pop() ) {

    try {

      await config.interfaces.sendSummary( summary );

    } catch ( e ) {

      log( 'error', 'Cannot send summary of notifications:', e );

    }

  }

}

function sendSummary( summary, cb ) {

  q( summary, cb );

}
