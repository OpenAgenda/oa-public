import Redis from 'ioredis';
import clearAndDumbBucket from '../clearAndDumpBucket.js';
import createRedisKey from '../utils/createRedisKey.js';
import clearRedisKeys from '../clearRedisKeys.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('clearAndDumpBucket', () => {
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

    it('test', async () => {
      const now = Date.now();
      const key = createRedisKey('usageCounter', 'users', 1);
      await redisCli.sadd('existingKeys', key);
      const value = {
        begin: new Date(now - 2 * (60 * 60 * 1000)),
        end: new Date(now - 60 * 60 * 1000),
        store: {
          items: 4,
          volume: 150,
          calls: 2,
        },
      };
      await redisCli.set(key, JSON.stringify(value));
      await clearAndDumbBucket(
        {
          knexClient: f.client,
          redisClient: redisCli,
          lifespan: 7000,
          setKey: 'existingKeys',
          redisPrefix: 'usageCounter',
        },
        key,
        value,
      );
      const row = await f
        .client('usage_counter')
        .select('*')
        .where('actor_identifier', 1);

      expect(row).toBeTruthy();
    });
  });
});
