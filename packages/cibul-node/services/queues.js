'use strict';

const redis = require('redis');

const Queues = require('@openagenda/queues').v2;

module.exports.init = function init(config) {
  const logger = config.getLogConfig('svc', 'queues');

  return Queues({
    logger,
    redis: config.redisClient || redis.createClient(config.port, config.host),
    prefix: config.queuesPrefix ?? 'q:'
  });
};
