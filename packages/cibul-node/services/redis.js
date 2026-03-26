import IORedis from 'ioredis';

function createIORedisConnection(config) {
  if (config.redis.clusterMode) {
    return new IORedis.Cluster(config.redis.nodes, {
      redisOptions: {
        password: config.redis.password,
        maxRetriesPerRequest: null,
      },
    });
  }

  return new IORedis({
    port: config.redis.port,
    host: config.redis.host,
    maxRetriesPerRequest: null,
  });
}

export function init(config) {
  const ioRedisClient = createIORedisConnection(config);

  return Object.assign(ioRedisClient, {
    shutdown: async () => {
      await ioRedisClient.quit();
    },
  });
}
