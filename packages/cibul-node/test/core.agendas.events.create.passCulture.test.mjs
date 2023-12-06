import Core from '../core/index.mjs';
import Services from '../services/init.mjs';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional: core.agendas().events.create() - Pass Culture', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '020.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
        'bull',
        'files',
        'events',
        'agendas',
        'aggregators',
        'agendaEvents',
        'agendaLocations',
        'registrations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'accessTokens',
        'tracker',
        'images',
        'files',
        'imageFiles',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) { /* */ }
  });

  afterAll(() => core.services.simpleCache.clearAll());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    it('create an event with a passCulture payload', async () => {
      const event = await core.agendas(2010).events.create({
        title: 'Un event avec billetterie Pass',
        description: 'Test pass',
        timings: [{
          begin: new Date('2024-02-28T15:00:00+0100'),
          end: new Date('2024-02-28T20:00:00+0100'),
        }],
        location: {
          uid: 1234,
        },
        registration: [{
          type: 'link',
          value: null,
          service: 'passCulture',
          data: {
            venueId: 548,
            category: 'CINE_PLEIN_AIR',
            priceCategories: [
              {
                price: 12,
                label: 'Tarif normal',
              },
            ],
            dates: [
              {
                timingId: 1709128800000,
                priceCategoryIndex: 0,
                quantity: 300,
              },
            ],
          },
        }],
      }, {
        access: 'moderator',
      });

      expect(
        event.registration[0].value,
      ).toBe(
        testConfig.passCulture.offerLink.replace(':id', event.registration[0].data.id),
      );
    });
  });
});
