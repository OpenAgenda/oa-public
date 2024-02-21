import redis from 'redis';
import clearAndDumbBucket from '../clearAndDumpBucket';
import createRedisKey from '../utils/createRedisKey';
import clearRedisKeys from '../clearRedisKeys';
import config from '../testconfig';
import fixtures from './fixtures';

describe('clearAndDumpBucket', () => {
  const f = fixtures(config.mysql);
  let redisCli;

  beforeAll(async () => {
    await f.load();
    redisCli = redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });
    await redisCli.connect();
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
      await redisCli.sAdd('existingKeys', key);
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
