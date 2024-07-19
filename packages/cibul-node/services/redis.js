import redis from 'redis';
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

function createRedisConnection(config) {
  if (config.redis.clusterMode) {
    return redis.createCluster({
      rootNodes: config.redis.nodes.map(node => ({
        url: node,
      })),
      defaults: {
        password: config.redis.password,
      },
    });
  }

  return redis.createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
  });
}

export async function init(config) {
  const ioRedisClient = createIORedisConnection(config);

  const redisClient = createRedisConnection(config);
  await redisClient.connect();

  config.redisClient = redisClient;

  return Object.assign(redisClient, {
    ioRedis: ioRedisClient,
    shutdown: async () => {
      await ioRedisClient.quit();
      await redisClient.quit();
    },
  });
}
