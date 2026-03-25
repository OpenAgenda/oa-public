import Redis from 'ioredis';
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

export function createClient(redisConfig) {
  return new Redis({
    port: redisConfig.port,
    host: redisConfig.host,
  });
}
