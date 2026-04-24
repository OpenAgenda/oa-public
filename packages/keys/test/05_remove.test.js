import Redis from 'ioredis';
import testconfig from '../testconfig.js';
import service from '../service/index.js';
import setup from './fixtures/setup.js';

describe('keys - remove', () => {
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
    redisClient.disconnect();
    await knex.destroy();
  });

  it('remove a key by his id', async () => {
    expect(await service(1).remove()).toBe(1);
  });

  it('remove a key', async () => {
    expect(
      await service({
        type: 'userPublic',
        identifier: 98596585,
        key: '2733c8183cca49dcbfbaefd6c957f5b6',
      }).remove(),
    ).toBe(1);
  });
});
