'use strict';

const simpleCache = require('@openagenda/simple-cache');

module.exports.init = (config, services) => simpleCache({
  client: services.redis,
  prefix: config?.cachePrefix ?? 'simplecache',
  logger: config.getLogConfig('svc', 'simpleCache'),
});
