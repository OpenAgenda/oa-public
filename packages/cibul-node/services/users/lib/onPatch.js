'use strict';

const resetCache = require('./resetCache');

module.exports = function onPatch(_config, services) {
  return async context => {
    resetCache(services, context.result);
  };
};
