"use strict";

const log = require( '@openagenda/logs' )( 'core/tasks' );

const queue = require( '../services/queues' )( 'core' );

module.exports = Object.assign( () => queue.run(), {
  register: fns => {

    if ( !queue ) return log( 'warn', 'queue is not set' );

    return queue.register( fns );

  },
  enqueue: ( ...args ) => queue.apply( null, args )
} );

// for the moment, initialization in core test env is different from dev or prod
if ( queue ) {
  queue.on( 'execute', log.bind( null, 'info' ) );
  queue.on( 'error', log.bind( null, 'error' ) );
  queue.on( 'success', log.bind( null, 'success' ) );
}
