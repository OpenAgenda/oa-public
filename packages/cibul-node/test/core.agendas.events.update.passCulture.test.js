import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { produce } from 'immer';

import Core from '../core/index.js';
import Services from '../services/init.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

import passAPIFixtures from './fixtures/passAPI.js';
import freshEventWithPassData from './fixtures/freshEventWithPassData.js';

const mockSuccessfullAddressPostResponse = async ({ request }) => {
  const r = await request.json();
  return HttpResponse.json({
    ...r,
    id: Math.ceil(Math.random() * 10000),
    banId: null,
  });
};

describe('core - functional: core.agendas().events.update() - Pass Culture', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '020.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
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
    } catch (e) {
      /* */
    }
  });

  afterAll(() => core.services.simpleCache.clearAll());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    describe('update an offer', () => {
      // créé une offre pas pending.
      // colle des modifs
      // vérifie qu'elles ont été apply
    });

    describe('update a pending offer', () => {
      let server;
      let event;

      beforeAll(() => {
        server = setupServer(
          http.get(
            `${testConfig.passCulture.api}/public/offers/v1/offerer_venues`,
            () => HttpResponse.json(passAPIFixtures.offererVenuesGetResponse),
          ),
          http.get(`${testConfig.passCulture.api}/openapi.json`, () =>
            HttpResponse.json(passAPIFixtures.openapi)),
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
            () =>
              HttpResponse.json(passAPIFixtures.priceCategoriesPostResponse),
          ),
          http.patch(
            `${testConfig.passCulture.api}/public/offers/v1/events/72585/price_categories/:priceCategoryId`,
            () =>
              HttpResponse.json(passAPIFixtures.priceCategoriesPatchResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/events/72585/dates`,
            () => HttpResponse.json(passAPIFixtures.datesPostResponse),
          ),
          http.post(
            `${testConfig.passCulture.api}/public/offers/v1/addresses`,
            mockSuccessfullAddressPostResponse,
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      beforeAll(async () => {
        event = await core.agendas(2010).events.create(freshEventWithPassData, {
          access: 'moderator',
        });
      });

      test('new items in pass data are processed by update', async () => {
        const passData = event.registration.find(
          ({ service }) => service === 'passCulture',
        ).data;

        const passDataWithUpdates = produce(passData, (draft) => {
          draft.push({
            priceCategories: [
              {
                id: 1,
                price: 13,
                label: "Tarif normal ajusté l'inflation",
              },
              {
                id: 3,
                price: 15,
                label: 'Tarif universel',
              },
            ],
          });
          draft.push({
            dates: [
              {
                id: 4,
                timingId: passData.find((entry) => entry.dates).dates[0]
                  .timingId,
                priceCategoryId: 3,
                quantity: 2,
              },
            ],
          });
        });

        const updated = await core.agendas(2010).events.patch(
          event.uid,
          {
            state: 2,
            registration: [
              {
                type: 'link',
                value: null, // 'https://passlink.fr',
                service: 'passCulture',
                data: passDataWithUpdates,
              },
            ],
          },
          { access: 'moderator' },
        );

        expect(
          updated.registration.find((r) => r.service === 'passCulture').data
            .length,
        ).toBe(passData.length + 3);
      });
    });
  });
});
