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

describe('simple-cache - functional (service): hash set', () => {
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

  it('set without specifying a key', async () => {
    await cache.hash('blob', 123).set('value');

    return new Promise(rs => {
      cli.hget(`${config.prefix}:blob:123`, '', (err, value) => {
        expect(value).toBe('value');
        rs();
      });
    });
  });

  it('set without specifying an identifier', async () => {
    await cache.hash('blarb').set('train');

    return new Promise(rs => {
      cli.hget(`${config.prefix}:blarb`, '', (err, value) => {
        expect(value).toBe('train');
        rs();
      });
    });
  });

  it('when given an object, set converts it to json', async () => {
    await cache.hash('blarb', 123).set('kaonachi', { iam: 'json' });

    return new Promise(rs => {
      cli.hget(`${config.prefix}:blarb:123`, 'kaonachi', (err, value) => {
        expect(value).toEqual('{"iam":"json"}');
        rs();
      });
    });
  });

  it(
    'set stores value in specific namespace, id, key redis key',
    () => new Promise(rs => {
      cli.get(`${config.prefix}:agenda:123`, (err, value) => {
        expect(value).toBeNull();

        cache.hash('agenda', 123).set('http://ponceau.paris', '<html>Chiiriie!</html>').then(() => {
          cli.hget(`${config.prefix}:agenda:123`, 'http://ponceau.paris', (_err2, value2) => {
            expect(value2).toBe('<html>Chiiriie!</html>');
            rs();
          });
        });
      });
    })
  );
});
