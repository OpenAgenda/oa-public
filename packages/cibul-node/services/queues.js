'use strict';

const Queues = require('@openagenda/queues');

module.exports.init = function init(config) {
  const logger = config.getLogConfig('svc', 'queues');

  return Queues({
    logger,
    redis: config.redisClient,
    prefix: config.queuesPrefix ?? 'q:',
  });
};
