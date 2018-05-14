"use strict";

const config = require( './config' );
const queue = require( './queue' );
const task = require( './task' );

module.exports = {
  init: c => {

    config.init( c );

    queue.init( c.queue );

  },
  app: require( './app' ),
  task
}