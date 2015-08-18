"use strict";

var q,

utils = require( 'utils' ),

build = require( './build' ),

log = require( 'logger' )( 'controlData', { lib: 'task' } );

module.exports = launch;

utils.extend( module.exports, {
  init: init,
  test: {
    process: process
  }
});

function launch() {

  q.setConsumer( process );

  q.launch();

}

function process( data, cb ) {

  log( 'processing for %s', data.id );

  build( data, cb );

}

function init( cfg ) {

  q = cfg.queue;

}