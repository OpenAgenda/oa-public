import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import Core from '../core/index.mjs';
import Services from '../services/init.mjs';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

import passAPIFixtures from './fixtures/passAPI.mjs';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(10);

const begin = new Date(tomorrow);

const freshEvent = {
  title: 'Un event avec billetterie Pass',
  description: 'Test pass',
  timings: [{
    begin,
    end: new Date(tomorrow.setHours(tomorrow.getHours() + 2)),
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
          id: 1,
          price: 12,
          label: 'Tarif normal',
        },
      ],
      dates: [
        {
          timingId: begin.getTime(),
          priceCategoryId: 1,
          quantity: 300,
        },
      ],
    },
  }],
};

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

    services.registrations.task();
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
    describe('create a complete offer', () => {
      let server;

      beforeAll(() => {
        server = setupServer(
          http.get(
            `${testConfig.passCulture.api}/openapi.json`,
            () => HttpResponse.json(passAPIFixtures.openapi),
          ),
          http.get(
            `${testConfig.passCulture.api}/public/offers/v1/offerer_venues`,
            () => HttpResponse.json(passAPIFixtures.offererVenuesGetResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events`,
            () => HttpResponse.json(passAPIFixtures.eventPostResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events/72585/price_categories`,
            () => HttpResponse.json(passAPIFixtures.priceCategoriesPostResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events/72585/dates`,
            () => HttpResponse.json(passAPIFixtures.datesPostResponse),
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      it('offer is created and registration data is updated', async () => {
        const event = await core.agendas(2010).events.create(freshEvent, {
          access: 'moderator',
        });

        expect(
          event.registration[0].value,
        ).toBe(
          testConfig.passCulture.offerLink.replace(':id', 72585),
        );
      });
    });

    describe('create a pending offer', () => {
      let server;
      let event;

      beforeAll(() => {
        server = setupServer(
          http.get(
            `${testConfig.passCulture.api}/openapi.json`,
            () => HttpResponse.json(passAPIFixtures.openapi),
          ),
          http.get(
            `${testConfig.passCulture.api}/public/offers/v1/offerer_venues`,
            () => HttpResponse.json(passAPIFixtures.offererVenuesGetResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events`,
            () => HttpResponse.json({
              ...passAPIFixtures.eventPostResponse,
              status: 'PENDING',
            }),
          ),
          http.get(
            `${testConfig.passCulture.api}/public/offers/v1/events/:id`,
            () => HttpResponse.json({
              ...passAPIFixtures.eventGetResponse,
              status: 'PENDING',
            }),
          ),
        );

        server.listen();
      });

      it(
        'when pending offer goes through task until max retries is reached, it stays marked as pending',
        () => new Promise(rs => {
          core.services.tracker.on('registrations.passCulture.enqueue.max', async () => {
            const { registration } = await core.agendas(2010).events.get(event.uid);
            const appliedPassProcessItems = registration
              .find(r => r.service === 'passCulture').data
              .filter(e => e.appliedAt);

            expect(
              appliedPassProcessItems.length,
            ).toBe(1);

            expect(appliedPassProcessItems[0].response.isPending).toBe(true);

            rs();
          });

          core.agendas(2010).events.create(freshEvent, {
            access: 'moderator',
          }).then(e => {
            event = e;
          });
        }),
      );

      afterAll(() => {
        server.close();
      });
    });

    describe('completion of pending offer', () => {
      let server;
      let event;

      beforeAll(() => {
        server = setupServer(
          http.get(
            `${testConfig.passCulture.api}/openapi.json`,
            () => HttpResponse.json(passAPIFixtures.openapi),
          ),
          http.get(
            `${testConfig.passCulture.api}/public/offers/v1/offerer_venues`,
            () => HttpResponse.json(passAPIFixtures.offererVenuesGetResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events`,
            () => HttpResponse.json({
              ...passAPIFixtures.eventPostResponse,
              status: 'PENDING',
            }),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events/72585/price_categories`,
            () => HttpResponse.json(passAPIFixtures.priceCategoriesPostResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events/72585/dates`,
            () => HttpResponse.json(passAPIFixtures.datesPostResponse),
          ),
          http.get(
            `${testConfig.passCulture.api}/public/offers/v1/events/:id`,
            () => HttpResponse.json(passAPIFixtures.eventGetResponse),
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      it(
        'pending offer that is retried and no longer pending sees its reference data updated in stored event',
        () => new Promise(rs => {
          core.services.tracker.on('registrations.passCulture.pendingOffer.processed.notPending', async () => {
            const { registration } = await core.agendas(2010).events.get(event.uid);
            const appliedPassProcessItems = registration
              .find(r => r.service === 'passCulture').data
              .filter(e => e.appliedAt);

            expect(
              appliedPassProcessItems.length,
            ).toBe(4);

            expect(appliedPassProcessItems[1].response.isPending).toBe(false);

            rs();
          });

          core.agendas(2010).events.create(freshEvent, {
            access: 'moderator',
          }).then(e => {
            event = e;
          });
        }),
      );
    });
  });
});
