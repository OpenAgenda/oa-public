'use strict';

const logs = require('@openagenda/logs');

module.exports = namespace => {
  const log = logs(namespace);
  return prefix => {
    log('info', prefix + ': called');
    return (...args) => log.apply(null, ['info', prefix + ': ' + args.shift()].concat(args))
  }
}
