"use strict";

const logger = require( 'basic-logger' );
const queue = require( 'queue' );

let config;
let knex;
let service;
let log;
let q;

module.exports = Object.assign( addActivity, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  log = logger( 'activities/notifications/addActivity' );
  q = queue( config.queue.names.addActivity, { redis: config.queue.redis } );

}

function addActivity( identifiers, activity, cb ) {

  q( { identifiers, activity }, cb );

}
