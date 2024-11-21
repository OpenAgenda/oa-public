import knexLib from 'knex';
import config from '../testconfig.js';
import Service from '../index.js';
import loadFixtures from './fixtures/load.js';
import fixtures from './fixtures/02.data.js';

describe('02 - control data - update', () => {
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
    await redisClient.del(`${config.redisPrefix}456`);

    await redisClient.quit();

    await knex.destroy();
  });

  describe('simple update', () => {
    const aeRef = {
      agendaUid: 456,
      eventUid: 4,
      legacyId: '2.3',
    };

    let updated;
    let updatedCtlData;

    beforeAll(async () => {
      updated = await service.update(aeRef, {
        uid: 4,
        slug: 'an-updated-event',
        timezone: 'Europe/Paris',
        locationUid: 2,
        location: {
          uid: 2,
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

      updatedCtlData = JSON.parse(
        await redisClient.get(`${config.redisPrefix}456`),
      );
    });

    test('result contains updated event', () => {
      expect(updated.event.u).toBe(4);
    });

    test('stored data contains updated values', () => {
      expect(updatedCtlData.ev[1].s).toBe('an-updated-event');
    });
  });

  describe('batch update', () => {
    let result;
    // let updatedCtlData;

    beforeAll(async () => {
      result = await service.batch({
        uid: 4,
        slug: 'an-updated-event',
        timezone: 'Europe/Paris',
        locationUid: 2,
        location: {
          uid: 2,
          latitude: 44.854797,
          longitude: -0.568099,
        },
        timings: [
          {
            begin: new Date('2019-01-10T10:15:00+0400'),
            end: new Date('2019-01-10T12:00:00+0400'),
          },
        ],
      });

      // updatedCtlData = JSON.parse(await redisClient.get(`${config.redisPrefix}456`));
    });

    test('batch result contains updated event', () => {
      expect(result[0].event.u).toBe(4);
    });
  });
});
