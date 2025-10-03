import _ from 'lodash';
import knexLib from 'knex';
import redis from 'redis';
import testconfig from '../testconfig.js';
import service from './service/index.js';

describe('keys - list', () => {
  let knex;
  let redisClient;

  beforeAll(async () => {
    knex = knexLib({
      client: 'mysql2',
      connection: testconfig.mysql,
    });

    redisClient = redis.createClient(testconfig.redis.connection);
    await redisClient.connect();

    await service.initAndLoad({
      ...testconfig,
      redis: {
        ...testconfig.redis,
        client: redisClient,
      },
      knex,
    });
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
