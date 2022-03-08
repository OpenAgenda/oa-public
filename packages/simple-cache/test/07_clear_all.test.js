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

  beforeAll(() => {
    cli = redis.createClient(config.redis.port, config.redis.host);
  });

  beforeAll(() => {
    cache = sCache(config);
  });

  afterAll(() => cli.quit());

  it(
    'clears all keys in service namespace',
    async () => {
      await cache.hash('king', 'kong').set('size', 'tiny');
      await cache.hash('brique', 1).set('verte');

      await cache.clearAll();

      return new Promise(rs => {
        cli.keys(`${prefix}*`, (err, keys) => {
          expect(keys.length).toBe(0);
          rs();
        });
      });
    }
  );
});
