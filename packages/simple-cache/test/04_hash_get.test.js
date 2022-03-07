'use strict';

const redis = require('redis');

const config = {
  redis: {
    host: process.env.HOST,
    port: process.env.PORT
  },
  prefix: process.env.PREFIX
};

const sCache = require('..');

describe('simple-cache - functional (service): hash get', () => {
  let cli;
  let cache;

  beforeAll(() => {
    cli = redis.createClient(config.redis.port, config.redis.host);
  });

  beforeAll(() => {
    cache = sCache(config);
  });

  beforeEach(async () => new Promise(rs => {
    cli.keys(`${config.prefix}*`, (err, keys) => {
      cli.del(keys, () => rs());
    });
  }));

  afterAll(() => cli.quit());

  describe('promise', () => {
    it('hash get without specifying a key', () => new Promise(rs => {
      cli.hset(
        `${config.prefix}:blob:456`, '',
        'Bim',
        async () => {
          const value = await cache.hash('blob', 456).get();
          expect(value).toBe('Bim');
          rs();
        }
      );
    }));

    it('hash get without specifying an identifier', () => new Promise(rs => {
      cli.hset(
        `${config.prefix}:blab`, '456',
        'Biim',
        async () => {
          const value = await cache.hash('blab').get(456);
          expect(value).toBe('Biim');
          rs();
        }
      );
    }));

    it(
      'hash get fetches value stored specific namespace, id, key redis key',
      () => new Promise(rs => {
        cli.hset(
          `${config.prefix}:agenda:123`,
          'http://lepassageduponceau.fr',
          '<html>Les lundi</html>',
          _err => {
            cache.hash('agenda', 123).get('http://lepassageduponceau.fr').then(value => {
              expect(value).toBe('<html>Les lundi</html>');
              rs();
            });
          }
        );
      })
    );

    it(
      'hash get parses json if json option is set',
      () => new Promise(rs => {
        cli.hset(
          `${config.prefix}:agenda:123`,
          'tinykingkong',
          '{"iam": "json"}',
          _err => {
            cache.hash('agenda', 123).get('tinykingkong', { json: true }).then(value => {
              expect(value).toEqual({ iam: 'json' });
              rs();
            });
          }
        );
      })
    );

    it(
      'hash get returns null if no value was found',
      () => new Promise(rs => {
        cache('agenda', 456).get('bloublou').then(value => {
          expect(value).toBeNull();
          rs();
        });
      })
    );
  });
});
