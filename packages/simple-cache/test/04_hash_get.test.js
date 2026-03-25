import Redis from 'ioredis';
import sCache from '../index.js';
import config from './config.js';

describe('simple-cache - functional (service): hash get', () => {
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

  describe('promise', () => {
    it('hash get without specifying a key', async () => {
      await cli.hset(`${config.prefix}:blob:456`, '', 'Bim');

      const value = await cache.hash('blob', 456).get();
      expect(value).toBe('Bim');
    });

    it('hash get without specifying an identifier', async () => {
      await cli.hset(`${config.prefix}:blab`, '456', 'Biim');

      const value = await cache.hash('blab').get(456);
      expect(value).toBe('Biim');
    });

    it('hash get fetches value stored specific namespace, id, key redis key', async () => {
      await cli.hset(
        `${config.prefix}:agenda:123`,
        'http://lepassageduponceau.fr',
        '<html>Les lundi</html>',
      );

      const value = await cache
        .hash('agenda', 123)
        .get('http://lepassageduponceau.fr');
      expect(value).toBe('<html>Les lundi</html>');
    });

    it('hash get parses json if json option is set', async () => {
      await cli.hset(
        `${config.prefix}:agenda:123`,
        'tinykingkong',
        '{"iam": "json"}',
      );

      const value = await cache
        .hash('agenda', 123)
        .get('tinykingkong', { json: true });
      expect(value).toEqual({ iam: 'json' });
    });

    it('hash get returns null if no value was found', async () => {
      const value = await cache('agenda', 456).get('bloublou');
      expect(value).toBeNull();
    });
  });
});
