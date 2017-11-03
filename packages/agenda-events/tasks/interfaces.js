"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'tasks/interfaces' );

let interfaces, queue, svc;

module.exports = _.extend( run, {
  init: ( c, k, s ) => {

    queue = c.queues.interfaces;
    interfaces = c.interfaces;
    svc = s;
    
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