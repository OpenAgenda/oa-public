import Redis from 'ioredis';
import sCache from '../index.js';
import config from './config.js';

describe('simple-cache - functional (service): set', () => {
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
    it('set without specifying a key', async () => {
      await cache('blob', 123).set('value', 1);

      const value = await cli.get(`${config.prefix}:blob:123`);

      expect(value).toBe('value');
    });

    it('set without specifying an identifier', async () => {
      await cache('blarb').set('train', 1);

      const value = await cli.get(`${config.prefix}:blarb`);

      expect(value).toBe('train');
    });

    it('set converts object to JSON', async () => {
      await cache('blaaaa').set('rgh', { thisIsJSON: true }, 10);

      const value = await cli.get(`${config.prefix}:blaaaa:rgh`);

      expect(value).toBe('{"thisIsJSON":true}');
    });

    it('set stores value in specific namespace, id, key redis key', async () => {
      const value = await cli.get(
        `${config.prefix}:agenda:123:http://ponceau.paris`,
      );

      expect(value).toBeNull();

      await cache('agenda', 123).set(
        'http://ponceau.paris',
        '<html>Chiiriie!</html>',
        1,
      );

      const updatedValue = await cli.get(
        `${config.prefix}:agenda:123:http://ponceau.paris`,
      );

      expect(updatedValue).toBe('<html>Chiiriie!</html>');
    });

    it('set stores value with defined ttl', async () => {
      await cache('agenda', 123).set(
        'http://ponceau.paris',
        '<html>Blob</html>',
        1,
      );

      await new Promise((rs) => setTimeout(rs, 1500));

      const value = await cli.get(
        `${config.prefix}:agenda:123:http://ponceau.paris`,
      );
      expect(value).toBe(null);
    }, 10000);
  });

  describe('error handling', () => {
    it('VError adds arguments in redis error when thrown', async () => {
      const info = await cache('blob')
        .set('value')
        .catch((e) => e)
        .then((e) => e.info);
      expect(info).toEqual({
        namespace: 'blob',
        identifier: null,
        key: '',
        ttlValue: undefined,
        value: 'value',
      });
    });
  });
});
