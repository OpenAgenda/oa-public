'use strict';

const simpleCache = require('@openagenda/simple-cache');

module.exports.init = config => simpleCache({
  client: config.redisClient,
  prefix: config?.cachePrefix ?? 'simplecache',
  logger: config.getLogConfig('svc', 'simpleCache'),
});
