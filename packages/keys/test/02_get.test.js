import _ from 'lodash';
import sinon from 'sinon';
import knexLib from 'knex';
import Redis from 'ioredis';
import testconfig from '../testconfig.js';
import config from '../service/config.js';
import service from './service/index.js';

describe('keys - get', () => {
  let knex;
  let redisClient;

  beforeAll(async () => {
    knex = knexLib({
      client: 'mysql2',
      connection: { ...testconfig.mysql },
    });

    redisClient = new Redis(config.redis.connection);

    await service.initAndLoad({
      ...testconfig,
      redis: { ...testconfig.redis, client: redisClient },
      knex,
    });
  });

  afterAll(() => knex.destroy());
  afterAll(() => redisClient.disconnect());

  afterEach(async () => {
    const { prefix } = testconfig.redis;
    for (const key of await redisClient.keys(`${prefix}*`)) {
      await redisClient.del(key);
    }
  });

  it('get a key by his id', async () => {
    const result = await service(1).get();

    expect(_.omit(result, ['key', 'createdAt'])).toEqual({
      id: 1,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Vielle clé !',
    });
  });

  it('get a key', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98596585,
      key: '2733c8183cca49dcbfbaefd6c957f5b6',
    }).get();

    expect(_.omit(result, ['key', 'createdAt'])).toEqual({
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null,
    });
  });

  it('get by key', async () => {
    const result = await service({
      key: '2733c8183cca49dcbfbaefd6c957f5b6',
    }).get();

    expect(_.omit(result, ['key', 'createdAt'])).toEqual({
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null,
    });
  });

  it('get by key - without cache', async () => {
    const exceptedResult = {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null,
    };

    const spy = sinon.spy(config, 'knex');
    expect(spy.callCount).toBe(0);

    let result = await service({
      key: '2733c8183cca49dcbfbaefd6c957f5b6',
    }).get();

    expect(spy.callCount).toBe(1);
    expect(_.omit(result, ['key', 'createdAt'])).toEqual(exceptedResult);

    result = await service({ key: '2733c8183cca49dcbfbaefd6c957f5b6' }).get();

    expect(spy.callCount).toBe(2);
    expect(_.omit(result, ['key', 'createdAt'])).toEqual(exceptedResult);

    spy.restore();
  });

  it('get by key - with cache', async () => {
    const exceptedResult = {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null,
    };

    const spy = sinon.spy(config, 'knex');
    expect(spy.callCount).toBe(0);

    let result = await service({ key: '2733c8183cca49dcbfbaefd6c957f5b6' }).get(
      { cache: true },
    );

    expect(spy.callCount).toBe(1);
    expect(_.omit(result, ['key', 'createdAt'])).toEqual(exceptedResult);

    result = await service({ key: '2733c8183cca49dcbfbaefd6c957f5b6' }).get({
      cache: true,
    });

    expect(spy.callCount).toBe(1);
    expect(_.omit(result, ['key', 'createdAt'])).toEqual(exceptedResult);
  });
});
