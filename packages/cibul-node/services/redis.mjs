import redis from 'redis';

export async function init(config) {
  const redisClient = config.redis.clusterMode
    ? redis.createCluster({
      rootNodes: config.redis.nodes.map(node => ({
        url: node,
      })),
      defaults: {
        password: config.redis.password,
      },
    })
    : redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

  await redisClient.connect();

  config.redisClient = redisClient;

  return Object.assign(redisClient, {
    shutdown: async () => {
      await redisClient.quit();
    },
  });
}
