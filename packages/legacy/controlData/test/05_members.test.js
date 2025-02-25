import knexLib from 'knex';
import config from '../testconfig.js';
import Service from '../index.js';
import loadFixtures from './fixtures/load.js';
import fixtures from './fixtures/05.data.js';

describe('05 - control data - members', () => {
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
    await redisClient.del(`${config.redisPrefix}789`);

    await redisClient.quit();

    await knex.destroy();
  });

  describe('insert and remove', () => {
    test('set adds user uid to control data', async () => {
      await service.memberSet({ agendaUid: 789, userUid: 1, role: 1 });

      const updatedCtlData = JSON.parse(
        await redisClient.get(`${config.redisPrefix}789`),
      );

      expect(updatedCtlData).toEqual({ ev: [], l: [], e: [1] });
    });

    test('remove removes user uid from control data', async () => {
      await service.memberSet({ agendaUid: 789, userUid: 1, role: 1 });

      await service.memberRemove({ agendaUid: 789, userUid: 1 });

      const updatedCtlData = JSON.parse(
        await redisClient.get(`${config.redisPrefix}789`),
      );

      expect(updatedCtlData).toEqual({ ev: [], l: [], e: [] });
    });
  });
});
