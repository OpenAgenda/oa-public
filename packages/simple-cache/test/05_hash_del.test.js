import Redis from 'ioredis';
import sCache from '../index.js';
import config from './config.js';

describe('simple-cache - functional (service): hash del', () => {
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
