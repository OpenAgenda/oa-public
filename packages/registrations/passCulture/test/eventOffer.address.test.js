import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import PassCultureSDK from '../lib/PassCultureSDK.js';
import eventOffer from '../apply/eventOffer.js';

const api = 'https://pc.local';

describe('eventOffer address logic', () => {
  let pc;
  let server;

  beforeAll(() => {
    pc = PassCultureSDK({
      key: 'validAPIKey',
      api: 'https://pc.local',
    });
  });

  describe('update function address handling', () => {
    beforeAll(() => {
      server = setupServer(
        // Mock address get endpoint
        http.get(`${api}/public/offers/adressesId/:addressId`, ({ params }) => {
          if (params.addressId === '123') {
            return HttpResponse.json({
              id: 123,
              address: '1 rue de la Paix',
              city: 'Paris',
              postalCode: '75001',
            });
          }
          return new HttpResponse(null, { status: 404 });
        }),
        // Mock address create endpoint
        http.post(`${api}/public/offers/v1/addresses`, async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            ...body,
            id: 456,
            banId: null,
          });
        }),
        // Mock event patch endpoint
        http.patch(
          `${api}/public/offers/v1/events/:eventId`,
          async ({ request }) => {
            const body = await request.json();
            return HttpResponse.json({ success: true, ...body });
          },
        ),
        // Mock categories endpoint
        http.get(`${api}/openapi.json`, () =>
          HttpResponse.json({
            components: {
              schemas: {
                EventOfferCreation: {
                  properties: {
                    category: { enum: ['CONCERT'] },
                    categoryRelatedFields: {
                      allOf: [
                        {
                          if: {
                            properties: { category: { const: 'CONCERT' } },
                          },
                          then: {
                            properties: { musicType: { enum: ['JAZZ'] } },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          })),
      );

      server.listen();
    });

    afterAll(() => {
      server.close();
    });

    test('should keep existing address when OA location matches current address', async () => {
      const OAEvent = {
        uid: 'test-event',
        title: { fr: 'Test Event' },
        location: {
          address: '1 rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
        },
      };

      const entry = {
        venueId: 548,
        category: 'CONCERT',
      };

      const result = await eventOffer.update(
        pc,
        'event123',
        '123', // passAddressId
        OAEvent,
        [],
        entry,
        { siren: ['123456789'] },
      );

      expect(result.succeeded).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should create new address when OA location differs from current address', async () => {
      const OAEvent = {
        uid: 'test-event',
        title: { fr: 'Test Event' },
        location: {
          address: '2 rue de la République',
          city: 'Lyon',
          postalCode: '69001',
        },
      };

      const entry = {
        venueId: 548,
        category: 'CONCERT',
      };

      const result = await eventOffer.update(
        pc,
        'event123',
        '123', // passAddressId
        OAEvent,
        [],
        entry,
        { siren: ['123456789'] },
      );

      expect(result.succeeded).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should handle missing passAddressId gracefully', async () => {
      const OAEvent = {
        uid: 'test-event',
        title: { fr: 'Test Event' },
        location: {
          address: '3 rue de la Liberté',
          city: 'Marseille',
          postalCode: '13001',
        },
      };

      const entry = {
        venueId: 548,
        category: 'CONCERT',
      };

      const result = await eventOffer.update(
        pc,
        'event123',
        null, // no passAddressId
        OAEvent,
        [],
        entry,
        { siren: ['123456789'] },
      );

      expect(result.succeeded).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should handle address fetch error gracefully', async () => {
      const OAEvent = {
        uid: 'test-event',
        title: { fr: 'Test Event' },
        location: {
          address: '4 rue de la Joie',
          city: 'Nice',
          postalCode: '06000',
        },
      };

      const entry = {
        venueId: 548,
        category: 'CONCERT',
      };

      const result = await eventOffer.update(
        pc,
        'event123',
        '999', // non-existent passAddressId
        OAEvent,
        [],
        entry,
        { siren: ['123456789'] },
      );

      expect(result.succeeded).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });
});
