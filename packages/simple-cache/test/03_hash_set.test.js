import Redis from 'ioredis';
import sCache from '../index.js';
import config from './config.js';

describe('simple-cache - functional (service): hash set', () => {
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

  it('set without specifying a key', async () => {
    await cache.hash('blob', 123).set('value');

    const value = await cli.hget(`${config.prefix}:blob:123`, '');
    expect(value).toBe('value');
  });

  it('set without specifying an identifier', async () => {
    await cache.hash('blarb').set('train');

    const value = await cli.hget(`${config.prefix}:blarb`, '');
    expect(value).toBe('train');
  });

  it('when given an object, set converts it to json', async () => {
    await cache.hash('blarb', 123).set('kaonachi', { iam: 'json' });

    const value = await cli.hget(`${config.prefix}:blarb:123`, 'kaonachi');
    expect(value).toEqual('{"iam":"json"}');
  });

  it('set stores value in specific namespace, id, key redis key', async () => {
    const value = await cli.get(`${config.prefix}:agenda:123`);
    expect(value).toBeNull();

    await cache
      .hash('agenda', 123)
      .set('http://ponceau.paris', '<html>Chiiriie!</html>');

    const value2 = await cli.hget(
      `${config.prefix}:agenda:123`,
      'http://ponceau.paris',
    );
    expect(value2).toBe('<html>Chiiriie!</html>');
  });
});
