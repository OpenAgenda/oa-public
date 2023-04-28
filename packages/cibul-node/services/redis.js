'use strict';

const redis = require('redis');

function createClient(redisConfig) {
  return redis.createClient(
    redisConfig.port,
    redisConfig.host,
  );
}

async function createCluster(redisConfig) {
  const cluster = createCluster(redisConfig.params);

  await cluster.connect();

  return cluster;
}

module.exports.init = async config => {
  const redisClient = config.redis.clusterMode ? await createCluster(config.redis) : createClient(config.redis);

  config.redisClient = redisClient;

  return Object.assign(redisClient, {
    shutdown: async () => {
      await redisClient.quit();
    },
  });
};
