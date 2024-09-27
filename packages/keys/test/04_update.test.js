'use strict';

const _ = require('lodash');
const redis = require('redis');
const knexLib = require('knex');
const testconfig = require('../testconfig');
const service = require('./service');

describe('keys - update', () => {
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

  it('update a key by his id', async () => {
    const result = await service(1).update({ label: 'The key of dead' });

    expect(_.omit(result, ['key', 'createdAt'])).toEqual({
      id: 1,
      type: 'userPublic',
      identifier: 98596585,
      label: 'The key of dead',
    });
  });

  it('update a label of key by key', async () => {
    const result = await service({
      type: 'userPublic',
      identifier: 98596585,
      key: '2733c8183cca49dcbfbaefd6c957f5b6',
    }).update({ label: 'Clé' });

    expect(_.omit(result, ['key', 'createdAt'])).toEqual({
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Clé',
    });
  });

  it('update a key', async () => {
    let error;

    try {
      await service({ type: 'userPublic', identifier: 98596585 }).update({
        label: 'Clé',
      });
    } catch (e) {
      error = e;
    }

    expect(error.name).toBe('ValidationError');
  });
});
