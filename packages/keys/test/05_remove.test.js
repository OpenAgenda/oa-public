'use strict';

const redis = require('redis');
const knexLib = require('knex');
const testconfig = require('../testconfig');
const service = require('./service');

describe('keys - remove', () => {
  let knex;
  let redisClient;

  beforeAll(async () => {
    knex = knexLib({
      client: 'mysql',
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
