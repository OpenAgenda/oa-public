import 'dotenv/config';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { produce } from 'immer';

import spreadPCData from '../apply/spreadPCData.js';
import getObjectType from '../apply/getObjectType.js';
import getMatchingPassId from '../apply/getMatchingPassId.js';
import PassCultureSDK from '../lib/PassCultureSDK.js';
import apply from '../apply/index.js';

import bambiEvent from './fixtures/bambi.event.json';
import CArtEvents from './fixtures/cart.events.json';
import openAPIData from './fixtures/openapi.json';
import unnapplied from './fixtures/data.unnapplied.pc.json';
import partiallyApplied from './fixtures/data.withUpdate.pc.json';
import withPriceCategoryUpdate from './fixtures/data.withPriceCategoryUpdate.pc.json';
import withDateUpdate from './fixtures/data.withDateUpdate.pc.json';
import getEventResponse from './fixtures/eventGetResponse.json';
import withPendingOffer from './fixtures/data.withPendingOffer.pc.json';

const api = 'https://pc.local';

const mockSuccessfulPriceCategoriesPostResponse = async ({ request }) => HttpResponse.json({
  priceCategories: (await request.json()).priceCategories.map(priceCategory => ({
    ...priceCategory,
    id: Math.ceil(Math.random() * 10000),
  })),
});

const mockSuccessfulDatesPostResponse = async ({ request }) => HttpResponse.json({
  dates: (await request.json()).dates.map(date => ({
    ...date,
    id: Math.ceil(Math.random() * 10000),
  })),
});

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
          http.post(
            `${api}/public/offers/v1/events`,
            () => HttpResponse.json({
              id: randomPassOfferID,
              status: 'PASPENDING',
            }),
          ),
          http.post(
            `${api}/public/offers/v1/events/:id/price_categories`,
            mockSuccessfulPriceCategoriesPostResponse,
          ),
          http.post(
            `${api}/public/offers/v1/events/:id/dates`,
            mockSuccessfulDatesPostResponse,
          ),
          http.get(`${api}/openapi.json`, () => HttpResponse.json(openAPIData)),
        );

        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      describe('create offer only, no price categories or dates', () => {
        let processed;

        beforeAll(async () => {
          processed = await apply(pc, bambiEvent, {
            venueId: 123,
            category: 'CINE_PLEIN_AIR',
          });
        });

        test('returned processed item has an appliedAt timestamp', () => {
          expect(processed[0].appliedAt instanceof Date).toBe(true);
        });

        test('if no priceCategories or dates are in provided create data, returned processed data is an array of length of 1', () => {
          expect(Array.isArray(processed)).toBe(true);

          expect(processed.length).toBe(1);
        });

        test('returned item has data that was provided completed with an appliedAt and a response key', () => {
          expect(Object.keys(processed[0])).toEqual([
            'venueId',
            'category',
            'response',
            'appliedAt',
          ]);
        });

        test('response key of processed data containes passId and isPending keys', () => {
          expect(processed[0].response).toEqual({
            passId: randomPassOfferID,
            isPending: false,
          });
        });
      });

      describe('create offer with price categories and dates', () => {
        let processed;

        beforeAll(async () => {
          const [CArtEvent] = CArtEvents;
          const timingId = CArtEvent.timings.map(t => new Date(t.begin).getTime()).pop();

          processed = await apply(pc, CArtEvent, {
            venueId: 123,
            category: 'CINE_PLEIN_AIR',
            priceCategories: [{
              label: 'Tarif réduit',
              price: 8,
              id: 0,
            }, {
              label: 'Plein tarif',
              price: 14,
              id: 1,
            }],
            dates: [{
              id: 2,
              timingId,
              priceCategoryId: 0,
              quantity: 3,
            }],
          });
        });

        test('processed data has parts of entry spread over as many entries as there are object types', () => {
          expect(Object.keys(processed[0])).toEqual([
            'venueId',
            'category',
            'response',
            'appliedAt',
          ]);

          expect(Object.keys(processed[1])).toEqual([
            'priceCategories',
            'response',
            'appliedAt',
          ]);

          expect(Object.keys(processed[2])).toEqual([
            'dates',
            'response',
            'appliedAt',
          ]);
        });
      });
    });

    describe('pending', () => {
      let server;

      beforeAll(() => {
        server = setupServer(
          http.get(
            `${api}/public/offers/v1/events/:id`,
            async ({ params }) => HttpResponse.json({
              ...getEventResponse,
              id: parseInt(params.id, 10),
              status: params.id === '123456' ? 'PENDING' : 'WHICHEVER',
            }),
          ),
          http.post(
            `${api}/public/offers/v1/events/:id/price_categories`,
            mockSuccessfulPriceCategoriesPostResponse,
          ),
          http.post(
            `${api}/public/offers/v1/events/:id/dates`,
            mockSuccessfulDatesPostResponse,
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
          processed = await apply(pc, CArtEvents[0], withPendingOffer);
        });

        test('no changes are made on pending offer data', () => {
          expect(processed).toEqual(withPendingOffer);
        });
      });

      describe('no longer pending', () => {
        let processed;
        const noLongerPending = produce(withPendingOffer, draft => { draft[0].response.passId = 5421; });

        beforeAll(async () => {
          processed = await apply(pc, CArtEvents[0], noLongerPending);
        });

        test('all remaining operations are executed', () => {
          expect(processed.filter(item => item.appliedAt).length).toBe(4);
        });

        test('isPending is switched to false in newly inserted response item', () => {
          expect(processed[1].response).toEqual({
            isPending: false,
          });
        });
      });
    });

    describe('with priceCategory update', () => {
      let server;

      beforeAll(() => {
        server = setupServer(
          http.patch(
            `${api}/public/offers/v1/events/:eventOfferId/price_categories/:id`,
            async ({ request, params }) => HttpResponse.json({
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
        const processed = await apply(pc, CArtEvents[0], withPriceCategoryUpdate);

        expect(processed[processed.length - 1].appliedAt instanceof Date).toBe(true);
      });
    });

    describe('with a date update', () => {
      let server;

      beforeAll(() => {
        server = setupServer(
          http.patch(
            `${api}/public/offers/v1/events/:eventOfferId/dates/:id`,
            async ({ request, params }) => HttpResponse.json({
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
        const processed = await apply(pc, CArtEvents[0], withDateUpdate);

        expect(processed[processed.length - 1].appliedAt instanceof Date).toBe(true);
      });
    });
  });

  describe('unit', () => {
    describe('getMatchingPassId', () => {
      test('retrieves passId matching a given id from PC data set', () => {
        expect(
          getMatchingPassId(partiallyApplied, 1),
        ).toBe(789789);
      });
    });

    describe('getObjectType', () => {
      test('evaluates what operation is required for given item', () => {
        expect(
          getObjectType({ priceCategories: [] }),
        ).toBe('priceCategories');
      });
    });
    describe('spreadPCData', () => {
      test('data is spread according to single item single API call principle', () => {
        expect(unnapplied.length).toBe(2);

        expect(spreadPCData(unnapplied).length).toBe(4);
      });

      test('items which contain mixed updates and creates are spread', () => {
        const spread = spreadPCData(partiallyApplied);

        expect(spread[3]).toEqual({
          priceCategories: [{
            id: 0,
            price: 457,
            label: 'updated',
          }],
        });

        expect(spread[4]).toEqual({
          priceCategories: [{
            id: 3,
            price: 78,
            label: 'new pricing',
          }],
        });
      });

      test('when already applied, first item keeps its appliedAt and response keys', () => {
        const spread = spreadPCData(withPriceCategoryUpdate);

        expect(Object.keys(spread[0])).toEqual([
          'duo',
          'venueId',
          'category',
          'musicType',
          'bookingContact',
          'response',
          'appliedAt',
        ]);
      });
    });
  });
});
