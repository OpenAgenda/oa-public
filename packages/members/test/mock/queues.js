'use strict';

/**
 * here we pretend-queue
 */

const ons = {
  register: () => {},
  run: () => {},
  queue: () => {}
};

module.exports = Object.assign(
  namespace => Object.assign(queue, {
    run,
    register,
    on: () => {}
  }),
  {
    mockOn: on
  }
);

function queue(...args) {
  ons.queue.apply(null, args);
}

function run() {
  ons.run();
}

function register(methods) {
  ons.register(methods);
}

function on(action, fn) {
  ons[ action ] = fn;
}
