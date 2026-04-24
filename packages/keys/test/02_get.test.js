import _ from 'lodash';
import sinon from 'sinon';
import Redis from 'ioredis';
import testconfig from '../testconfig.js';
import config from '../service/config.js';
import service from '../service/index.js';
import setup from './fixtures/setup.js';

describe('keys - get', () => {
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
