'use strict';

const redis = require('redis');

const config = {
  redis: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  prefix: process.env.PREFIX,
};

const sCache = require('..');

describe('simple-cache - functional (service): hash get', () => {
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
    it('hash get without specifying a key', async () => {
      await cli.hSet(
        `${config.prefix}:blob:456`,
        '',
        'Bim',
      );

      const value = await cache.hash('blob', 456).get();
      expect(value).toBe('Bim');
    });

    it('hash get without specifying an identifier', async () => {
      await cli.hSet(`${config.prefix}:blab`, '456', 'Biim');

      const value = await cache.hash('blab').get(456);
      expect(value).toBe('Biim');
    });

    it(
      'hash get fetches value stored specific namespace, id, key redis key',
      () => new Promise(rs => {
        cli.hSet(
          `${config.prefix}:agenda:123`,
          'http://lepassageduponceau.fr',
          '<html>Les lundi</html>',
        ).then(() => {
          cache.hash('agenda', 123).get('http://lepassageduponceau.fr').then(value => {
            expect(value).toBe('<html>Les lundi</html>');
            rs();
          });
        });
      }),
    );

    it(
      'hash get parses json if json option is set',
      () => new Promise(rs => {
        cli.hSet(
          `${config.prefix}:agenda:123`,
          'tinykingkong',
          '{"iam": "json"}',
        ).then(() => {
          cache.hash('agenda', 123).get('tinykingkong', { json: true }).then(value => {
            expect(value).toEqual({ iam: 'json' });
            rs();
          });
        });
      }),
    );

    it(
      'hash get returns null if no value was found',
      () => new Promise(rs => {
        cache('agenda', 456).get('bloublou').then(value => {
          expect(value).toBeNull();
          rs();
        });
      }),
    );
  });
});
