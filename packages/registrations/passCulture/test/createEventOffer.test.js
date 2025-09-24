import 'dotenv/config';
import createEventOffer from '../createEventOffer.js';

import PassCultureSDK from '../lib/PassCultureSDK.js';

import fixtures from './fixtures/cart.events.json';

const pickEvent = (slug) => fixtures.find((e) => slug === e.slug);

const { PASS_API_KEY: key, PASS_API_DOMAIN: api } = process.env;

if (!key) {
  throw new Error('PASS_API_KEY env var must be defined');
}

describe('createEventOffer', () => {
  let pc;
  let venueId;

  beforeAll(async () => {
    pc = PassCultureSDK({ api, key });

    venueId = (await pc.offers.offererVenues())[0].venues[0].id;
  }, 60000); // 60 second timeout for integration test

  describe('Event offer errors', () => {
    it('throws error when venueId is not valid', async () => {
      const event = pickEvent(
        'inauguration-du-festival-international-du-film-dart-fifa',
      );

      const timingId = event.timings
        .map((t) => new Date(t.begin).getTime())
        .pop();

      let error;

      try {
        await createEventOffer(pc, event, {
          venueId: 123,
          category: 'CINE_PLEIN_AIR',
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
              timingId,
              priceCategoryId: 0,
              quantity: 3,
            },
          ],
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(Array.isArray(error.info.errors)).toBe(true);
    });

    it('throws error when category is not valid', async () => {
      const event = pickEvent(
        'inauguration-du-festival-international-du-film-dart-fifa',
      );

      const timingId = event.timings
        .map((t) => new Date(t.begin).getTime())
        .pop();

      let error;

      try {
        await createEventOffer(pc, event, {
          venueId,
          category: 'CHAMPIONNATS_PIERRE_PAPIER_CISEAU',
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
              timingId,
              priceCategoryId: 0,
              quantity: 3,
            },
          ],
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(Array.isArray(error.info.errors)).toBe(true);
    });
  });

  describe('Price category or dates errors', () => {
    it('stores priceCategory errors in an error key of result data, eventOffer id is provided', async () => {
      const event = pickEvent(
        'inauguration-du-festival-international-du-film-dart-fifa',
      );

      const result = await createEventOffer(pc, event, {
        venueId,
        category: 'CINE_PLEIN_AIR',
        priceCategories: [
          {
            label: '',
            price: 8,
            id: 0,
          },
        ],
      });

      expect(result.eventOffer.id).toBeDefined();

      expect(result.errors).toEqual([
        {
          message: 'failed to create price categories',
          fieldLabel: 'Pass Culture',
          code: 'registration.pass.invalidPriceCategory.label',
          label:
            'Toutes les catégories de prix doivent avoir un label de défini',
        },
      ]);
    });

    it('stores dates errors in an error key of result data, eventOffer id is provided', async () => {
      const event = pickEvent(
        'inauguration-du-festival-international-du-film-dart-fifa',
      );
      const timingId = event.timings
        .map((t) => new Date(t.begin).getTime())
        .pop();

      const result = await createEventOffer(pc, event, {
        venueId,
        category: 'CINE_PLEIN_AIR',
        priceCategories: [
          {
            label: 'Tarif normal',
            price: 8,
            id: 0,
          },
        ],
        dates: [
          {
            priceCategoryId: 0,
            timingId,
            quantity: -1,
          },
        ],
      });

      expect(result.eventOffer.id).toBeDefined();

      expect(result.errors).toEqual([
        {
          message: 'failed to create all dates',
          fieldLabel: 'Pass Culture',
          code: 'registration.pass.invalidDate.quantity',
          label:
            "Certaines dates n'ont pas pu être créées: les quantités saisies doivent être des entiers positifs",
        },
      ]);
    });
  });

  describe('Successful creates', () => {
    it('OAEvent with timings in DHM format', async () => {
      const { errors } = await createEventOffer(
        pc,
        {
          title: { fr: 'DHM' },
          timings: [
            {
              begin: { date: '2033-11-12', hours: 9, minutes: 30 },
              end: { date: '2033-11-12', hours: 12, minutes: 0 },
            },
          ],
        },
        {
          priceCategories: [
            {
              price: 3,
              label: 'Pouik',
              id: 0,
            },
          ],
          dates: [
            {
              priceCategoryId: 0,
              quantity: 789,
              timingId: 2015397000000,
            },
          ],
          venueId: 548,
          category: 'EVENEMENT_JEU',
        },
      );

      expect(errors).toBeNull();
    });
  });
});
