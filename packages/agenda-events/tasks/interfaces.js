"use strict";

const logger = require( 'basic-logger' );
const _ = require( 'lodash' );

let interfaces, queue, svc, log;

module.exports = _.extend( run, {
  init: ( c, k, s ) => {

    queue = c.queues.interfaces;
    interfaces = c.interfaces;
    svc = s;
    
    log = logger( 'agenda-events/tasks/interfaces' );

  }
} );

function run( options ) {

  queue.setConsumer( ( data, cb ) => {

    let name = data.shift();

    if ( !interfaces[ name ] ) {

      log( 'interface %s is not defined', interfaces[ name ] );

    } else {

      interfaces[ name ].apply( null, data );

    }

    cb();

  } );

  queue.launch( options || { interval: 10 } );

}