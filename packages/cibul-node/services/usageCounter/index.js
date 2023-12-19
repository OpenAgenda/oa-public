'use strict';

const UsageCounter = require('@openagenda/usageCounter');

module.exports.init = (config, services) => {
  return userCounters({
    bucketLifeSpan: 10006060*24,
    redisCli: services.redis,
  });
}