import knexLib from 'knex';
import config from '../testconfig.js';
import Service from '../index.js';
import loadFixtures from './fixtures/load.js';
import fixtures from './fixtures/03.data.js';

describe('03 - control data - remove', () => {
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
    await redisClient.del(`${config.redisPrefix}123`);

    await redisClient.quit();

    await knex.destroy();
  });

  describe('simple remove', () => {
    const aeRef = {
      agendaUid: 123,
      eventUid: 1,
      legacyId: '1.1',
    };

    let ctlData;

    beforeAll(async () => {
      await service.insert(aeRef, {
        uid: 1,
        slug: 'an-event',
        timezone: 'Europe/Paris',
        locationUid: 123,
        location: {
          uid: 95669829,
          latitude: 44.854797,
          longitude: -0.568099,
        },
        timings: [
          {
            begin: new Date('2018-12-20T10:15:00+0400'),
            end: new Date('2018-12-20T12:00:00+0400'),
          },
        ],
      });

      ctlData = JSON.parse(await redisClient.get(`${config.redisPrefix}123`));
    });

    test('event data is in control data before remove', () => {
      expect(ctlData.ev[0].u).toBe(1);
    });

    test('event data is removed from control data after remove', async () => {
      await service.remove(aeRef);

      ctlData = JSON.parse(await redisClient.get(`${config.redisPrefix}123`));

      expect(ctlData.ev.length).toBe(0);
    });
  });

  describe('batch remove', () => {
    const aeRef = {
      agendaUid: 123,
      eventUid: 1,
      legacyId: '1.1',
    };

    let ctlData;

    beforeAll(async () => {
      await service.insert(aeRef, {
        uid: 1,
        slug: 'an-event',
        timezone: 'Europe/Paris',
        locationUid: 123,
        location: {
          uid: 95669829,
          latitude: 44.854797,
          longitude: -0.568099,
        },
        timings: [
          {
            begin: new Date('2018-12-20T10:15:00+0400'),
            end: new Date('2018-12-20T12:00:00+0400'),
          },
        ],
      });

      ctlData = JSON.parse(await redisClient.get(`${config.redisPrefix}123`));
    });

    test('event data is in control data before remove', () => {
      expect(ctlData.ev[0].u).toBe(1);
    });

    test('event data is removed from control data after remove', async () => {
      await service.batchRemove({ uid: 1 });

      ctlData = JSON.parse(await redisClient.get(`${config.redisPrefix}123`));

      expect(ctlData.ev.length).toBe(0);
    });
  });
});
