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

describe('simple-cache - functional (service): get', () => {
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
      cli.del(keys.join(' '), () => rs());
    });
  }));

  afterAll(() => cli.quit());

  it(
    'get fetches value stored specific namespace, id, key redis key',
    () => new Promise(rs => {
      cli.set(
        `${config.prefix}agenda:123:http://lepassageduponceau.fr`,
        '<html>Les lundi</html>',
        _err => {
          cache('agenda', 123).get('http://lepassageduponceau.fr', (_err2, value) => {
            expect(value).toBe('<html>Les lundi</html>');
            rs();
          });
        }
      );
    })
  );

  it(
    'get returns null if no value was found',
    () => new Promise(rs => {
      cache('agenda', 456).get('bloublou', (err, value) => {
        expect(err).toBeNull();
        expect(value).toBeNull();
        rs();
      });
    })
  );
});
