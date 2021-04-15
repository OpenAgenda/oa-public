'use strict';

const redis = require('redis');
const log = require('@openagenda/logs')('services/redis');

module.exports.init = config => {
  const redisClient = redis
    .createClient(
      config.redis.port,
      config.redis.host
    );
  
  config.redisClient = redisClient;

  return Object.assign(redisClient, {
    shutdown: async () => {
      await redisClient.quit();
    }
  });
};
