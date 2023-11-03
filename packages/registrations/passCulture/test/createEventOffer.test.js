import 'dotenv/config';
import createEventOffer from '../lib/createEventOffer';

import PassCultureSDK from '../lib/PassCultureSDK.js';

import fixtures from './fixtures/cart.events.json';

const pickEvent = slug => fixtures.find(e => slug === e.slug);

const {
  PASS_API_KEY: key,
  PASS_API_DOMAIN: api,
} = process.env;

if (!key) {
  throw new Error('PASS_API_KEY env var must be defined');
}

describe('createEventOffer', () => {
  let pc;
  let venueId;

  beforeAll(async () => {
    pc = PassCultureSDK({ api, key });

    venueId = (await pc.offers.offererVenues())[0].venues[0].id;
  });

  describe('Event offer errors', () => {
    it('throws error when venueId is not valid', async () => {
      const event = pickEvent('inauguration-du-festival-international-du-film-dart-fifa');
  
      const timingId = event.timings.map(t => new Date(t.begin).getTime()).pop();
  
      let error;
  
      try {
        await createEventOffer(
          pc,
          event,
          {
            venueId: 123,
            category: 'CINE_PLEIN_AIR',
            priceCategories: [{
              label: 'Tarif réduit',
              price: 8,
            }, {
              label: 'Plein tarif',
              price: 14
            }],
            dates: [{
              timingId,
              priceCategoryIndex: 0,
              quantity: 3,
            }],
          }
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(Array.isArray(error.info.errors)).toBe(true);
    });
    
    it('throws error when category is not valid', async () => {
      const event = pickEvent('inauguration-du-festival-international-du-film-dart-fifa');
  
      const timingId = event.timings.map(t => new Date(t.begin).getTime()).pop();
  
      let error;
  
      try {
        await createEventOffer(
          pc,
          event,
          {
            venueId,
            category: 'CHAMPIONNATS_PIERRE_PAPIER_CISEAU',
            priceCategories: [{
              label: 'Tarif réduit',
              price: 8,
            }, {
              label: 'Plein tarif',
              price: 14
            }],
            dates: [{
              timingId,
              priceCategoryIndex: 0,
              quantity: 3,
            }],
          }
        )
      } catch (e) {
        error = e;
      }
  
      expect(error.name).toBe('BadRequest');
      expect(Array.isArray(error.info.errors)).toBe(true);
    });
  });

  describe('Price category or dates errors', () => {
    it('stores priceCategory errors in an error key of result data, eventOffer id is provided', async () => {
      const event = pickEvent('inauguration-du-festival-international-du-film-dart-fifa');
  
      const result = await createEventOffer(
        pc,
        event,
        {
          venueId,
          category: 'CINE_PLEIN_AIR',
          priceCategories: [{
            label: '',  
            price: 8, 
          }]
        },
      );
  
      expect(result.eventOffer.id).toBeDefined();
  
      expect(result.error).toEqual({
        status: 400,
        data: {
          'priceCategories.0.label': [
            'ensure this value has at least 1 characters',
          ],
        },
      });
    });
  
    it('stores dates errors in an error key of result data, eventOffer id is provided', async () => {
      const event = pickEvent('inauguration-du-festival-international-du-film-dart-fifa');
      const timingId = event.timings.map(t => new Date(t.begin).getTime()).pop();
  
      const result = await createEventOffer(
        pc,
        event,
        {
          venueId,
          category: 'CINE_PLEIN_AIR',
          priceCategories: [{
            label: 'Tarif normal',
            price: 8
          }],
          dates: [{
            priceCategoryIndex: 0,
            timingId,
            quantity: -1,
          }],
        },
      );
  
      expect(result.eventOffer.id).toBeDefined();
  
      expect(result.error).toEqual({
        status: 400,
        data: {
          'dates.0.quantity': ['Value must be positive']
        },
      });
    });
  });
});