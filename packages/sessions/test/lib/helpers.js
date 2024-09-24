'use strict';

const redis = require('redis');
const express = require('express');

function launchTestApp(routes) {
  const app = express();

  Object.keys(routes).forEach((k) => {
    if (k === 'use') {
      return app.use(routes[k]);
    }

    const [method, path] = k.split(':');

    [].concat(routes[k]).forEach((r) => app[method](path, r));
  });

  return app.listen(3000);
}

function roundTrip(req, res) {
  res.send('ok');
}

module.exports.clearRedis = async function clearRedis(redisConfig, client) {
  const keys = await client.keys(`${redisConfig.prefix}:*`);

  for (const key of keys) {
    await client.del(key);
  }
};

module.exports.createClient = async function createClient(redisConfig) {
  const client = await redis.createClient({
    socket: {
      port: redisConfig.port,
      host: redisConfig.host,
    },
  });

  await client.connect();

  return client;
};

module.exports = {
  roundTrip,
  launchTestApp,
};
