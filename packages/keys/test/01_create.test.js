import _ from 'lodash';
import knexLib from 'knex';
import Redis from 'ioredis';
import config from '../testconfig.js';
import service from './service/index.js';

describe('keys - create', () => {
  let knex;
  let redisClient;

  beforeAll(async () => {
    knex = knexLib({
      client: 'mysql2',
      connection: { ...config.mysql },
    });

    redisClient = new Redis(config.redis.connection);

    await service.initAndLoad({
      ...config,
      redis: { ...config.redis, client: redisClient },
      knex,
    });
  });

  afterAll(() => knex.destroy());

  afterAll(async () => {
    const { prefix } = config.redis;
    for (const key of await redisClient.keys(`${prefix}*`)) {
      await redisClient.del(key);
    }
    redisClient.disconnect();
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
