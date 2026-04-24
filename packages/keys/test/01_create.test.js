import _ from 'lodash';
import Redis from 'ioredis';
import testconfig from '../testconfig.js';
import service from '../service/index.js';
import setup from './fixtures/setup.js';

describe('keys - create', () => {
  let knex;
  let redisClient;

  beforeAll(async () => {
    knex = await setup({
      mysql: testconfig.mysql,
      schemas: testconfig.schemas,
      data: [`${import.meta.dirname}/fixtures/key.data.sql`],
    });

    redisClient = new Redis(testconfig.redis.connection);

    await service.init({
      ...testconfig,
      redis: { ...testconfig.redis, client: redisClient },
      knex,
    });
  });

  afterAll(async () => {
    const { prefix } = testconfig.redis;
    for (const key of await redisClient.keys(`${prefix}*`)) {
      await redisClient.del(key);
    }
    redisClient.disconnect();
    await knex.destroy();
  });

  it('create an user key', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98596585,
    }).create({ label: 'Ma première clé #ému' });

    expect(_.omit(result, ['key', 'createdAt'])).toEqual({
      id: 3,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Ma première clé #ému',
    });
  });

  it('create an user key without label', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98596585,
    }).create();

    expect(_.omit(result, ['key', 'createdAt'])).toEqual({
      id: 4,
      type: 'userPublic',
      identifier: 98596585,
      label: null,
    });
  });
});
