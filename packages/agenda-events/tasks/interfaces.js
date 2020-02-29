'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('tasks/interfaces');

module.exports = (service, options) => {
  const {
    queue,
    config: {
      interfaces
    }
  } = service;

  queue.setConsumer((data, cb) => {
    const name = data.shift();

    if (!interfaces[name]) {
      log('interface %s is not defined', interfaces[name]);
    } else {
      interfaces[name].apply(null, data);
    }

    cb();
  });

  queue.launch(options || { interval: 10 });
}
