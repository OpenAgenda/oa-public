'use strict';

const redis = require('redis');
const sCache = require('..');

const config = {
  redis: {
    host: process.env.HOST,
    port: process.env.PORT
  },
  prefix: process.env.PREFIX
};

describe('simple-cache - functional (service): hash del', () => {
  let cache;
  let cli;

  beforeAll(() => {
    cli = redis.createClient(config.redis.port, config.redis.host);
  });

  beforeAll(() => {
    cache = sCache(config);
  });

  beforeEach(() => new Promise(rs => {
    cli.keys(`${config.prefix}*`, (err, keys) => {
      cli.del(keys.join(' '), rs);
    });
  }));

  afterAll(() => cli.quit());

  it('deletes the whole hash', async () => {
    const ns = 'agenda';
    const id = 898983;
    await cache.hash(ns, id).set('key1', 'value1');
    await cache.hash(ns, id).set('key2', 'value2');

    expect(await cache.hash(ns, id).get('key1')).toBe('value1');
    expect(await cache.hash(ns, id).get('key2')).toBe('value2');

    await cache.hash(ns, id).del();

    expect(await cache.hash(ns, id).get('key1')).toBe(null);
    expect(await cache.hash(ns, id).get('key2')).toBe(null);
  });
});
