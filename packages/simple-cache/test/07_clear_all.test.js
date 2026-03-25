import Redis from 'ioredis';
import sCache from '../index.js';
import config from './config.js';

describe('simple-cache - functional (service): clear all', () => {
  let cache;
  let cli;

  beforeAll(async () => {
    cli = new Redis({
      host: config.redis.host,
      port: config.redis.port,
    });
  });

  beforeAll(() => {
    cache = sCache({
      ...config,
      client: cli,
    });
  });

  beforeEach(async () =>
    cli.del(await cli.keys(`${config.prefix}*`).then((k) => k.join(' '))));

  afterAll(() => cli.quit());

  it('clears all keys in service namespace', async () => {
    await cache.hash('king', 'kong').set('size', 'tiny');
    await cache.hash('brique', 1).set('verte');

    await cache.clearAll();

    const keys = await cli.keys(`${config.prefix}*`);

    expect(keys.length).toBe(0);
  });
});
