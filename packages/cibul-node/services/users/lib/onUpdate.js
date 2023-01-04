'use strict';

const resetCache = require('./resetCache');

module.exports = function onUpdate(_config, services) {
  return async context => {
    await resetCache(services, context.result);
  };
};
