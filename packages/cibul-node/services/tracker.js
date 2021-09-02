'use strict';

const log = require('@openagenda/logs')('services/tracker');

/**
 * used for testing only
 */
module.exports.init = config => {
  log('initing');

  const stack = [];
  let on = null;
  const flush = () => {
    log('flush');
    const flushed = [];
    while (stack.length) {
      flushed.push(stack.shift());
    }
    return flushed;
  };

  return Object.assign(message => {
    if (!config.track) {
      return;
    }
    log('received %s', message);
    stack.push(message);
    if (on && (on[0] === message)) {
      on[1](stack.concat([]));
      if (on[2]) flush();
      on = null;
    }
  }, {
    flush,
    getStack: () => stack,
    on: (message, fn, flushStack = false) => {
      log('listening to %s', message);
      on = [message, fn, flushStack];
    },
    shutdown: async () => {
      log('shutting down');
      flush();
    }
  });
};
