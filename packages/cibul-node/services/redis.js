'use strict';

const redis = require('redis');

module.exports.init = async config => {
  const redisClient = await (
    config.redis.clusterMode ? redis.createCluster(config.redis.params) : redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    })
  );

  await redisClient.connect();

  config.redisClient = redisClient;

  return Object.assign(redisClient, {
    shutdown: async () => {
      await redisClient.quit();
    },
  });
};
