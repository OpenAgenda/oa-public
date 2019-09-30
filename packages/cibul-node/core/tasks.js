"use strict";

const log = require( '@openagenda/logs' )( 'core/tasks' );

const queues = require( '../services/queues' );

let queue, toRegister = {};

module.exports = Object.assign( (ons = {}) => {
  queue.on( 'execute', ons.execute || log.bind( null, 'info' ) );
  queue.on( 'error', ons.error || log.bind( null, 'error' ) );
  queue.on( 'success', ons.success || log.bind( null, 'success' ) );

  queue.run();
}, {
  register: fns => {
    if (!queue) {
      Object.assign(toRegister, fns);
    } else {
      queue.register(fns);
    }
  },
  enqueue: (...args) => queue.apply(null, args),
  loadQueue
} );

function loadQueue() {
  queue = queues('core');
  queue.register(toRegister);
}
