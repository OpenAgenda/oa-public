import Redis from 'ioredis';
import increment from '../increment.js';
import createRedisKey from '../utils/createRedisKey.js';
import clearRedisKeys from '../clearRedisKeys.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('increment', () => {
  const f = fixtures(config.mysql);
  let redisCli;

  beforeAll(async () => {
    await f.load();
    redisCli = new Redis({
      host: config.redis.host,
      port: config.redis.port,
    });
  });

  afterAll(f.destroyClient);
  afterAll(() => redisCli.quit());

  describe('basic', () => {
    beforeAll(async () => {
      await clearRedisKeys({
        redisClient: redisCli,
        setKey: 'existingKeys',
      });
    });

    it('when key is new', async () => {
      await increment(
        {
          knexClient: f.client,
          redisClient: redisCli,
          lifespan: 7000,
          clearAndDumpBucket: () => console.log('clearAndDump'),
          setKey: 'existingKeys',
          redisPrefix: 'usageCounter',
        },
        'users',
        1,
        null,
        {
          volume: 1,
          items: 1,
        },
      );
      const key = createRedisKey('usageCounter', 'users', 1);
      const keyValue = JSON.parse(await redisCli.get(key));
      expect(keyValue.store).toStrictEqual({
        volume: 1,
        items: 1,
        calls: 1,
      });
    });
  });
});
