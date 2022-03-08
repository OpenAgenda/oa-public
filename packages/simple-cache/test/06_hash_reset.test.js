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

  it('reset sets an expiry on the hash under which values are available and beyond which they are not', async () => {
    const ns = 'agenda';
    const id = 898;

    await cache.hash(ns, id).reset(2);

    await cache.hash(ns, id).set('key', 'value');

    await (new Promise(rs => setTimeout(rs, 1000)));

    expect(await cache.hash(ns, id).get('key')).toBe('value');

    await (new Promise(rs => setTimeout(rs, 1001)));

    expect(await cache.hash(ns, id).get('key')).toBe(null);
  });
});
