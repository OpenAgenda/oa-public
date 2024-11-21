import fs from 'node:fs';
import knexLib from 'knex';
import config from '../testconfig.js';
import Service from '../index.js';
import loadFixtures from './fixtures/load.js';
import fixtures from './fixtures/04.data.js';

describe('04 - control data - rebuild', () => {
  let redisClient;
  let knex;
  let service;

  beforeAll(async () => {
    redisClient = await loadFixtures(config, fixtures);

    knex = knexLib({ client: 'mysql', connection: config.mysql });

    service = Service({
      knex,
      redis: redisClient,
      prefix: config.redisPrefix,
    });
  });

  afterAll(async () => {
    await redisClient.del(`${config.redisPrefix}83549053`);

    await redisClient.quit();

    await knex.destroy();
  });

  test('rebuild', async () => {
    const data = await service.rebuild(83549053);

    expect(JSON.stringify(data, null, 2)).toEqual(
      fs
        .readFileSync(
          `${import.meta.dirname}/fixtures/redis/bordeaux-metropole.rebuilt.json`,
          'utf-8',
        )
        .trim('\n'),
    );
  });
});
