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

  it('reset sets an expiry on the hash under which values are available and beyond which they are not', async () => {
    const ns = 'agenda';
    const id = 898;

    await cache.hash(ns, id).reset(2);

    await cache.hash(ns, id).set('key', 'value');

    await new Promise((rs) => setTimeout(rs, 1000));

    expect(await cache.hash(ns, id).get('key')).toBe('value');

    await new Promise((rs) => setTimeout(rs, 1001));

    expect(await cache.hash(ns, id).get('key')).toBe(null);
  });
});
