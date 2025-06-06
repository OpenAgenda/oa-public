import 'dotenv/config';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { produce } from 'immer';
import { BadRequest } from '@openagenda/verror';

import { getObjectType } from '../iso/utils.js';
import getOperationType from '../iso/getOperationType.js';
import getMatchingPassId from '../iso/getMatchingPassId.js';
import PassCultureSDK from '../lib/PassCultureSDK.js';
import apply from '../apply/index.js';

import CArtEvents from './fixtures/cart.events.json';
import openAPIData from './fixtures/openapi.json';
import partiallyApplied from './fixtures/data.withUpdate.pc.json';
import withPriceCategoryUpdate from './fixtures/data.withPriceCategoryUpdate.pc.json';
import withDateUpdate from './fixtures/data.withDateUpdate.pc.json';
import withDateDelete from './fixtures/data.withDateDelete.pc.json';
import getEventResponse from './fixtures/eventGetResponse.json';
import withPendingOffer from './fixtures/data.withPendingOffer.pc.json';
import settings from './fixtures/settings.json';

const applyValidTimingId = (entries, event) => {
  const validTimingIds = event.timings.map((t) => new Date(t.begin).getTime());

  return produce(entries, (draft) => {
    for (const entry of draft) {
      if (entry.dates) {
        entry.dates = entry.dates.map((date, index) => ({
          ...date,
          timingId: validTimingIds[index] ?? validTimingIds[0],
        }));
      }
    }
  });
};

const api = 'https://pc.local';

const mockSuccessfullPriceCategoriesPostResponse = async ({ request }) =>
  HttpResponse.json({
    priceCategories: (await request.json()).priceCategories.map(
      (priceCategory) => ({
        ...priceCategory,
        id: Math.ceil(Math.random() * 10000),
      }),
    ),
  });

const mockSuccessfullDatesPostResponse = async ({ request }) =>
  HttpResponse.json({
    dates: (await request.json()).dates.map((date) => ({
      ...date,
      id: Math.ceil(Math.random() * 10000),
    })),
  });

const mockErrorPiceCategoriesPostResponse = async () =>
  new HttpResponse(
    JSON.stringify({
      'priceCategories.0.price': [
        'ensure this value is less than or equal to 30000',
      ],
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

const mockSuccessfullAddressPostResponse = async ({ request }) => {
  const r = await request.json();
  return HttpResponse.json({
    ...r,
    id: Math.ceil(Math.random() * 10000),
    banId: null,
  });
};

describe('apply', () => {
  let pc;

  beforeAll(async () => {
    pc = PassCultureSDK({
      key: 'validAPIKey',
      api: 'https://pc.local',
    });
  });

  describe('integrated', () => {
    describe('simple create', () => {
      const randomPassOfferID = Math.ceil(Math.random() * 100000);
      let server;
      beforeAll(() => {
        server = setupServer(
          http.get(`${api}/public/offers/v1/offerer_venues`, () =>
            HttpResponse.json(settings.offererVenues)),
          http.post(`${api}/public/offers/v1/events`, () =>
            HttpResponse.json({
              id: randomPassOfferID,
              status: 'PASPENDING',
            })),
          http.post(
            `${api}/public/offers/v1/events/:id/price_categories`,
            mockSuccessfullPriceCategoriesPostResponse,
          ),
          http.post(
            `${api}/public/offers/v1/events/:id/dates`,
            mockSuccessfullDatesPostResponse,
          ),
          http.get(`${api}/openapi.json`, () => HttpResponse.json(openAPIData)),
          http.post(
            `${api}/public/offers/v1/addresses`,
            mockSuccessfullAddressPostResponse,
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      describe('create offer with price categories and dates', () => {
        let processed;

        beforeAll(async () => {
          const [CArtEvent] = CArtEvents;
          const timingId = CArtEvent.timings
            .map((t) => new Date(t.begin).getTime())
            .pop();

          processed = await apply(
            { pc, siren: ['123456789'] },
            CArtEvent,
            {
              venueId: 548,
              category: 'CINE_PLEIN_AIR',
              bookingContact: 'clem@oa.com',
              priceCategories: [
                {
                  label: 'Tarif réduit',
                  price: 8,
                  id: 0,
                },
                {
                  label: 'Plein tarif',
                  price: 14,
                  id: 1,
                },
              ],
              dates: [
                {
                  id: 2,
                  timingId,
                  priceCategoryId: 0,
                  quantity: 3,
                },
              ],
            },
            {
              categories: settings.categories,
              related: settings.related,
            },
          );
        });

        test('response key of processed data containes passId and isPending keys', () => {
          expect(processed[0].response).toEqual({
            passId: randomPassOfferID,
            isPending: false,
            addressId: expect.any(Number),
          });
        });

        test('processed data has parts of entry spread over as many entries as there are object types', () => {
          expect(Object.keys(processed[0])).toEqual([
            'category',
            'venueId',
            'bookingContact',
            'response',
            'appliedAt',
            'operation',
          ]);

          expect(Object.keys(processed[1])).toEqual([
            'priceCategories',
            'response',
            'appliedAt',
            'operation',
          ]);

          expect(Object.keys(processed[2])).toEqual([
            'dates',
            'response',
            'appliedAt',
            'operation',
          ]);
        });
      });
    });

    describe('pending', () => {
      let server;

      beforeAll(() => {
        const statusForId = (id) => {
          if (id === '123456') {
            return 'PENDING';
          }
          if (id === '654321') {
            return 'REJECTED';
          }
          return 'WHICHEVER';
        };
        server = setupServer(
          http.get(`${api}/public/offers/v1/events/:id`, async ({ params }) =>
            HttpResponse.json({
              ...getEventResponse,
              id: parseInt(params.id, 10),
              status: statusForId(params.id),
            })),
          http.post(
            `${api}/public/offers/v1/events/:id/price_categories`,
            mockSuccessfullPriceCategoriesPostResponse,
          ),
          http.post(
            `${api}/public/offers/v1/events/:id/dates`,
            mockSuccessfullDatesPostResponse,
          ),
          http.get(`${api}/openapi.json`, () => HttpResponse.json(openAPIData)),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      describe('still pending', () => {
        let processed;

        beforeAll(async () => {
          processed = await apply(
            { pc, siren: ['123456789'] },
            CArtEvents[0],
            withPendingOffer,
            settings,
          );
        });

        test('no changes are made on pending offer data', () => {
          expect(processed).toEqual(withPendingOffer);
        });
      });

      describe('no longer pending', () => {
        let processed;
        const noLongerPending = produce(withPendingOffer, (draft) => {
          draft[0].response.passId = 5421;
        });

        beforeAll(async () => {
          processed = await apply(
            { pc, siren: ['123456789'] },
            CArtEvents[0],
            noLongerPending,
            settings,
          );
        });

        test('all remaining operations are executed', () => {
          expect(processed.filter((item) => item.appliedAt).length).toBe(4);
        });

        test('isPending is switched to false in newly inserted response item', () => {
          expect(processed[1].response).toEqual({
            isPending: false,
          });
        });
      });

      describe('rejected', () => {
        let processed;
        const rejected = produce(withPendingOffer, (draft) => {
          draft[0].response.passId = 654321;
        });

        beforeAll(async () => {
          processed = await apply(
            { pc, siren: ['123456789'] },
            CArtEvents[0],
            rejected,
            { ...settings },
          );
        });

        test('all remaining operations stopped', () => {
          expect(processed.filter((item) => item.appliedAt).length).toBe(
            rejected.filter((item) => item.appliedAt).length + 1,
          );
        });

        test('isRejected is switched to true in newly inserted response item', () => {
          expect(processed[1].response).toEqual({
            isPending: false,
            isRejected: true,
          });
        });
      });
    });

    describe('error on priceCategories', () => {
      let server;

      beforeAll(() => {
        const randomPassOfferID = Math.ceil(Math.random() * 100000);
        server = setupServer(
          http.get(`${api}/public/offers/v1/events/:id`, async ({ params }) =>
            HttpResponse.json({
              ...getEventResponse,
              id: parseInt(params.id, 10),
              status: params.id === '123456' ? 'PENDING' : 'WHICHEVER',
            })),
          http.post(`${api}/public/offers/v1/events`, () =>
            HttpResponse.json({
              id: randomPassOfferID,
              status: 'PASPENDING',
            })),
          http.post(
            `${api}/public/offers/v1/events/:id/price_categories`,
            mockErrorPiceCategoriesPostResponse,
          ),
          http.post(
            `${api}/public/offers/v1/events/:id/dates`,
            mockSuccessfullDatesPostResponse,
          ),
          http.get(`${api}/openapi.json`, () => HttpResponse.json(openAPIData)),
          http.get(`${api}/public/offers/v1/offerer_venues`, () =>
            HttpResponse.json(settings.offererVenues)),
          http.post(
            `${api}/public/offers/v1/addresses`,
            mockSuccessfullAddressPostResponse,
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      describe('errored', () => {
        let processed;

        beforeAll(async () => {
          const timingId = CArtEvents[0].timings
            .map((t) => new Date(t.begin).getTime())
            .pop();
          processed = await apply(
            { pc, siren: ['123456789'] },
            CArtEvents[0],
            {
              venueId: 548,
              category: 'CINE_PLEIN_AIR',
              bookingContact: 'clem@oa.com',
              priceCategories: [
                {
                  label: 'Tarif réduit',
                  price: 8,
                  id: 0,
                },
                {
                  label: 'Plein tarif',
                  price: 14,
                  id: 1,
                },
              ],
              dates: [
                {
                  id: 2,
                  timingId,
                  priceCategoryId: 0,
                  quantity: 3,
                },
              ],
            },
            { ...settings },
          );
        });

        test('all remaining operations stoped', () => {
          expect(processed[1].error).toStrictEqual(
            new BadRequest(
              {
                info: {
                  'priceCategories.0.price': [
                    'ensure this value is less than or equal to 30000',
                  ],
                },
              },
              'priceCategories create',
            ),
          );
        });
      });
    });

    describe('with priceCategory update', () => {
      let server;

      beforeAll(() => {
        server = setupServer(
          http.patch(
            `${api}/public/offers/v1/events/:eventOfferId/price_categories/:id`,
            async ({ request, params }) =>
              HttpResponse.json({
                ...await request.json(),
                id: params.id,
              }),
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      test('last item of processed elements contains an appliedAt timestamp', async () => {
        const processed = await apply(
          { pc, siren: ['123456789'] },
          CArtEvents[0],
          applyValidTimingId(withPriceCategoryUpdate, CArtEvents[0]),
          settings,
        );

        expect(processed[processed.length - 1].appliedAt instanceof Date).toBe(
          true,
        );
      });
    });

    describe('with a date update', () => {
      let server;

      beforeAll(() => {
        server = setupServer(
          http.patch(
            `${api}/public/offers/v1/events/:eventOfferId/dates/:id`,
            async ({ request, params }) =>
              HttpResponse.json({
                ...await request.json(),
                id: params.id,
              }),
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      test('last item of processed elements contains an appliedAt timestamp', async () => {
        const processed = await apply(
          { pc, siren: ['123456789'] },
          CArtEvents[0],
          applyValidTimingId(withDateUpdate, CArtEvents[0]),
          settings,
        );

        expect(processed[processed.length - 1].appliedAt instanceof Date).toBe(
          true,
        );
      });
    });

    describe('with a date deletion', () => {
      let server;

      beforeAll(() => {
        server = setupServer(
          http.delete(
            `${api}/public/offers/v1/events/:eventOfferId/dates/:id`,
            async () => new HttpResponse(''),
          ),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      test('last item of processed elements contains an appliedAt timestamp', async () => {
        const processed = await apply(
          { pc, siren: ['123456789'] },
          CArtEvents[0],
          applyValidTimingId(withDateDelete, CArtEvents[0]),
          settings,
        );

        expect(processed[processed.length - 1].appliedAt instanceof Date).toBe(
          true,
        );
      });
    });
  });

  describe('unit', () => {
    describe('getMatchingPassId', () => {
      test('retrieves passId matching a given id from PC data set', () => {
        expect(getMatchingPassId(partiallyApplied, 1)).toBe(789789);
      });
    });

    describe('getObjectType', () => {
      test('evaluates what operation is required for given item', () => {
        expect(getObjectType({ priceCategories: [] })).toBe('priceCategories');
      });

      test('entry with eventDuration is of eventOffer type', () => {
        expect(getObjectType({ eventDuration: 210 })).toBe('eventOffer');
      });
    });

    describe('getOperationType', () => {
      test('eventOffer update', () => {
        const operationType = getOperationType(
          [
            {
              duo: true,
              eventDuration: 210,
              category: 'CONCERT',
              musicType: 'JAZZ-AVANT_GARDE_JAZZ',
              venueId: 548,
              bookingContact: 'fdqfdsqfdsq@fdsqfdsq.com',
              response: {
                passId: 72771,
                isPending: false,
              },
              appliedAt: '2024-06-11T09:52:16.657Z',
              operation: 'create',
            },
            {
              priceCategories: [
                {
                  price: 0,
                  label: 'Tarif unique',
                  id: 0,
                },
              ],
              response: {
                priceCategories: [
                  {
                    passId: 4733,
                    id: 0,
                  },
                ],
              },
              appliedAt: '2024-06-11T09:52:17.168Z',
              operation: 'create',
            },
            {
              eventDuration: 210,
            },
          ],
          'eventOffer',
          {
            eventDuration: 210,
          },
        );

        expect(operationType).toBe('update');
      });
    });
  });
});
