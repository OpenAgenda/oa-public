'use strict';

const log = require('@openagenda/logs')('users/hooks/callInterface');

module.exports = function callInterface(name, options) {
  return context => {
    const { config } = context.service;

    if (!config.interfaces || typeof config.interfaces[name] !== 'function') {
      log.info(`callInterface: interface '${name}' does not exist`);

      return context;
    }

    return config.interfaces[name](options)(context);
  };
};
