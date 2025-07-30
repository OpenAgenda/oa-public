import redis from 'redis';
import express from 'express';

export function launchTestApp(routes) {
  const app = express();

  Object.keys(routes).forEach((k) => {
    if (k === 'use') {
      return app.use(routes[k]);
    }

    const [method, path] = k.split(':');

    [].concat(routes[k]).forEach((r) => app[method](path, r));
  });

  return app.listen(4000);
}

export function roundTrip(req, res) {
  res.send('ok');
}

export async function clearRedis(redisConfig, client) {
  const keys = await client.keys(`${redisConfig.prefix}:*`);

  for (const key of keys) {
    await client.del(key);
  }
}

export async function createClient(redisConfig) {
  const client = await redis.createClient({
    socket: {
      port: redisConfig.port,
      host: redisConfig.host,
    },
  });

  await client.connect();

  return client;
}
