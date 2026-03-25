import redis from 'redis';
import IORedis from 'ioredis';
import logs from '@openagenda/logs';

const log = logs('services/redis');

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
      rootNodes: config.redis.nodes.map((node) => ({
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

  const traced = new Proxy(redisClient, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function' && typeof prop === 'string') {
        return (...args) => {
          log.warn(
            'node-redis .%s() called from %s',
            prop,
            new Error().stack.split('\n')[2]?.trim(),
          );
          return value.apply(target, args);
        };
      }
      return value;
    },
  });

  config.redisClient = traced;

  return Object.assign(traced, {
    ioRedis: ioRedisClient,
    shutdown: async () => {
      await ioRedisClient.quit();
      await redisClient.quit();
    },
  });
}
