import Redis from 'ioredis';
import increment from '../increment.js';
import createRedisKey from '../utils/createRedisKey.js';
import clearRedisKeys from '../clearRedisKeys.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

describe('increment', () => {
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

    it('when key is new', async () => {
      await increment(
        {
          knex,
          redisClient: redisCli,
          lifespan: 7000,
          clearAndDumpBucket: () => console.log('clearAndDump'),
          setKey: 'existingKeys',
          redisPrefix: 'usageCounter',
          schema: config.schema,
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
