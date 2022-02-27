'use strict';

const redis = require('redis');
const sCache = require('..');

const config = {
  redis: {
    host: process.env.HOST,
    port: process.env.PORT
  },
  prefix: process.env.PREFIX
};

describe('simple-cache - functional (service): set', () => {
  let cache;
  let cli;

  beforeAll(() => {
    cli = redis.createClient(config.redis.port, config.redis.host);
  });

  beforeAll(() => {
    cache = sCache(config);
  });

  beforeEach(() => new Promise(rs => {
    cli.keys(`${config.prefix}*`, (err, keys) => {
      cli.del(keys.join(' '), rs);
    });
  }));

  afterAll(() => cli.quit());

  it(
    'set stores value in specific namespace, id, key redis key',
    () => new Promise(rs => {
      cli.get(`${config.prefix}agenda:123`, (err, value) => {
        expect(value).toBeNull();

        cache('agenda', 123).set('http://ponceau.paris', '<html>Chiiriie!</html>', 1000, _err => {
          cli.get(`${config.prefix}agenda:123:http://ponceau.paris`, (_err2, value2) => {
            expect(value2).toBe('<html>Chiiriie!</html>');
            rs();
          });
        });
      });
    })
  );

  it(
    'set stores value with defined ttl',
    () => new Promise(rs => {
      cache('agenda', 123).set('http://ponceau.paris', '<html>Blob</html>', 1, _err => {
        setTimeout(() => {
          cli.get(`${config.prefix}agenda:123:http://ponceau.paris`, (_err2, value) => {
            expect(value).toBeNull();
            rs();
          });
        }, 2000);
      });
    })
  );
});
