"use strict";

const queue = require( '@openagenda/queue' );

let config;
let knex;
let service;
let q;

module.exports = Object.assign( addActivity, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  q = queue( config.queue.names.addActivity, { redis: config.queue.redis } );

}

function addActivity( identifiers, activity, cb ) {

  q( { identifiers, activity }, cb );

}
