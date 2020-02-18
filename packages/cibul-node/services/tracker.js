'use strict';

/**
 * used for testing only
 */
module.exports.init = config => {
  const stack = [];
  let on = null;
  const flush = () => {
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
    stack.push(message);
    if (on && (on[0]===message)) {
      on[1](stack.concat([]));
      if (on[2]) flush();
      on = null;
    }
  }, {
    flush,
    getStack: () => stack,
    on: (message, fn, flush = false) => { on = [message, fn, flush] }
  });
}
