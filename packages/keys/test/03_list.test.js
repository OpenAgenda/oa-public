import _ from 'lodash';
import Redis from 'ioredis';
import testconfig from '../testconfig.js';
import service from '../service/index.js';
import setup from './fixtures/setup.js';

describe('keys - list', () => {
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

  it('simple list', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98596585,
    }).list();

    expect(result.items.map((v) => _.omit(v, 'key', 'createdAt'))).toEqual([
      {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Vielle clé !',
      },
      {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null,
      },
    ]);
  });

  it('list an offset and a limit', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98596585,
    }).list(1, 1);

    expect(result.items.map((v) => _.omit(v, 'key', 'createdAt'))).toEqual([
      {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null,
      },
    ]);
  });

  it('list gives total', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98596585,
    }).list({ total: true });

    expect(result.total).toBe(2);
    expect(result.items.map((v) => _.omit(v, 'key', 'createdAt'))).toEqual([
      {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Vielle clé !',
      },
      {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null,
      },
    ]);
  });

  it('empty list', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98597885,
    }).list();

    expect(result.items.length).toBe(0);
  });
});
