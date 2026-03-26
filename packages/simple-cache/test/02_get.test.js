import Redis from 'ioredis';
import sCache from '../index.js';
import config from './config.js';

describe('simple-cache - functional (service): get', () => {
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
    it('get without specifying a key', async () => {
      await cli.set(`${config.prefix}:blob:456`, 'Bim');

      const value = await cache('blob', 456).get();
      expect(value).toBe('Bim');
    });

    it('get without specifying an identifier', async () => {
      await cli.set(`${config.prefix}:blab:456`, 'Biim');

      const value = await cache('blab').get(456);
      expect(value).toBe('Biim');
    });

    it('get fetches value stored specific namespace, id, key redis key', async () => {
      await cli.set(
        `${config.prefix}:agenda:123:http://lepassageduponceau.fr`,
        '<html>Les lundi</html>',
      );

      const value = await cache('agenda', 123).get(
        'http://lepassageduponceau.fr',
      );

      expect(value).toBe('<html>Les lundi</html>');
    });

    it('get returns null if no value was found', async () => {
      const value = await cache('agenda', 456).get('bloublou');
      expect(value).toBeNull();
    });
  });
});
