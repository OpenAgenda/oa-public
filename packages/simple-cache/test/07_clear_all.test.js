'use strict';

const redis = require('redis');
const sCache = require('..');

const prefix = process.env.PREFIX;

const config = {
  redis: {
    host: process.env.HOST,
    port: process.env.PORT
  },
  prefix
};

describe('simple-cache - functional (service): clear all', () => {
  let cache;
  let cli;

  beforeAll(async () => {
    cli = redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

    await cli.connect();
  });

  beforeAll(() => {
    cache = sCache({
      ...config,
      client: cli,
    });
  });

  beforeEach(async () => cli.del(
    await cli
      .keys(`${config.prefix}*`)
      .then(k => k.join(' ')),
  ));

  afterAll(() => cli.quit());

  it(
    'clears all keys in service namespace',
    async () => {
      await cache.hash('king', 'kong').set('size', 'tiny');
      await cache.hash('brique', 1).set('verte');

      await cache.clearAll();

      const keys = await cli.keys(`${prefix}*`);

      expect(keys.length).toBe(0);
    }
  );
});
