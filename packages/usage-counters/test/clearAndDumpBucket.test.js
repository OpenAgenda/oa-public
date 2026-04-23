import Redis from 'ioredis';
import clearAndDumbBucket from '../clearAndDumpBucket.js';
import createRedisKey from '../utils/createRedisKey.js';
import clearRedisKeys from '../clearRedisKeys.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

describe('clearAndDumpBucket', () => {
  let knex;
  let redisCli;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: { usageCounter: config.schema },
    });
    redisCli = new Redis({
      host: config.redis.host,
      port: config.redis.port,
    });
  });

  afterAll(async () => {
    await knex?.destroy();
    await redisCli?.quit();
  });

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
          knex,
          redisClient: redisCli,
          lifespan: 7000,
          setKey: 'existingKeys',
          redisPrefix: 'usageCounter',
          schema: config.schema,
        },
        key,
        value,
      );
      const row = await knex(config.schema)
        .select('*')
        .where('actor_identifier', 1);

      expect(row).toBeTruthy();
    });
  });
});
