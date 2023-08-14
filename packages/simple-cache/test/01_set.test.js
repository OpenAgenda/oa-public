'use strict';

const redis = require('redis');
const sCache = require('..');

const config = {
  redis: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  prefix: process.env.PREFIX,
};

describe('simple-cache - functional (service): set', () => {
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

    it(
      'set stores value in specific namespace, id, key redis key',
      async () => {
        const value = await cli.get(`${config.prefix}:agenda:123:http://ponceau.paris`);

        expect(value).toBeNull();

        await cache('agenda', 123).set('http://ponceau.paris', '<html>Chiiriie!</html>', 1);

        const updatedValue = await cli.get(`${config.prefix}:agenda:123:http://ponceau.paris`);

        expect(updatedValue).toBe('<html>Chiiriie!</html>');
      },
    );
  });

  describe('callback', () => {
    it(
      'set stores value in specific namespace, id, key redis key',
      () => new Promise(rs => {
        cli.get(`${config.prefix}:agenda:123`).then(value => {
          expect(value).toBeNull();

          cache('agenda', 123).set('http://ponceau.paris', '<html>Chiiriie!</html>', 1, _err => {
            cli.get(`${config.prefix}:agenda:123:http://ponceau.paris`).then(value2 => {
              expect(value2).toBe('<html>Chiiriie!</html>');
              rs();
            });
          });
        });
      }),
    );

    it(
      'set stores value with defined ttl',
      () => new Promise(rs => {
        cache('agenda', 123).set('http://ponceau.paris', '<html>Blob</html>', 1, _err => {
          setTimeout(() => {
            cli.get(`${config.prefix}:agenda:123:http://ponceau.paris`).then(value => {
              expect(value).toBe(null);
              rs();
            });
          }, 2000);
        });
      }),
    );

    it(
      'set converts object to JSON',
      () => new Promise(rs => {
        cache('blaaaa').set('rgh', { thisIsJSON: true }, 10, _err => {
          cli.get(`${config.prefix}:blaaaa:rgh`).then(value => {
            expect(value).toBe('{"thisIsJSON":true}');
            rs();
          });
        });
      }),
    );
  });
});
