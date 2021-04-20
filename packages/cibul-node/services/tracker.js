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
    log(message);
    stack.push(message);
    if (on && (on[0]===message)) {
      on[1](stack.concat([]));
      if (on[2]) flush();
      on = null;
    }
  }, {
    flush,
    getStack: () => stack,
    on: (message, fn, flush = false) => {
      log('setting on');
      on = [message, fn, flush]
    },
    shutdown: async () => {
      flush();
    }
  });
}
