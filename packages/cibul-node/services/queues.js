'use strict';

const Queues = require('@openagenda/queues');

module.exports.init = function init(config, services) {
  const logger = config.getLogConfig('svc', 'queues');

  return Queues({
    logger,
    redis: services.redis,
    prefix: config.queuesPrefix ?? 'q:',
  });
};
