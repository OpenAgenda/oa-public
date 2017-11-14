"use strict";

const build = require( './build' ),

queue = require( '@openagenda/queue' );

let q;

module.exports = Object.assign( launch, { init } );

function launch() {

  q.setConsumer( build );

  q.launch();

}

function init( cfg ) {

  q = queue( cfg.queuesNamespace + ':queue', { redis: cfg.redis } );

}