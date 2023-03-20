'use strict';

module.exports = function mergeConfig(...configs) {
  const result = {};

  for (const config of configs) {
    if (!config) continue;

    if ('namespace' in config) result.namespace = config.namespace;
    if ('token' in config) result.token = config.token;
    if ('debug' in config) result.debug = { ...result.debug, ...config.debug };
  }

  return result;
};
