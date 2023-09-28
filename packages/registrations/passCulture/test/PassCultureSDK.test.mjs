import 'dotenv/config';
import formatEvent from '../lib/formatEvent.mjs';
import PassCultureSDK from '../lib/PassCultureSDK.mjs';

import fixtures from './fixtures/cart.events.json' assert { type: 'json' };

const pickEvent = slug => fixtures.find(e => slug === e.slug);

const {
  PASS_API_KEY: key,
  PASS_TEST_EVENT_ID: testEventId,
} = process.env;

if (!key || !testEventId) {
  throw new Error('PASS_API_KEY and PASS_TEST_EVENT_ID env vars must be defined');
}

describe('PassCultureSDK', () => {
  describe('offers.offererVenues', () => {
    let items;

    beforeAll(async () => {
      const pc = PassCultureSDK(key);

      items = await pc.offers.offererVenues();
    });

    it('list call responds with a list of venues', () => {
      expect(Array.isArray(items)).toBe(true);
    });

    it('items are a pair of offerer and venues', () => {
      const [venue] = items;

      expect(Object.keys(venue)).toEqual(['offerer', 'venues']);
    });

    it('offerer is the organization linked to a set of venues, it is defined by an id, a name and a siren', () => {
      const [{ offerer }] = items;
      ['id', 'name', 'siren'].forEach(k => expect(
        Object.keys(offerer).includes(k)
      ).toBe(true));
    });

    it('the venues key of an item is a list of venues', () => {
      const [{ venues }] = items;

      expect(Array.isArray(venues)).toBe(true);
    });

    it('each venue contains an id, a legal name, a location and a siret among other values', () => {
      const [{ venues: [venue] }] = items;

      ['id', 'legalName', 'siret', 'location'].forEach(k => expect(Object.keys(venue).includes(k)).toBe(true));
    });
  });

  describe('offers.events', () => {
    let response;

    beforeAll(async () => {
      const pc = PassCultureSDK(key);

      const offererVenues = await pc.offers.offererVenues();

      response = await pc.offers.events.list({
        // venueId is not optional
        venueId: offererVenues[0].venues[0].id,
      });
    });

    it('response provides an events list and a pagination object', () => {
      Object.keys(response).forEach(k => expect(['events', 'pagination'].includes(k)).toBe(true));
    });
  });

  describe('offers.events.get', () => {
    let event;

    beforeAll(async () => {
      const pc = PassCultureSDK(key);

      event = await pc.offers.events(23808).get();
    });

    it('event has a name', () => {
      expect(
        Object.keys(event).includes('name'),
      ).toBe(true);
    });

    it('list price categories is provided in response', () => {
      expect(Array.isArray(event.priceCategories)).toBe(true);
    });
  });

  describe('offers.events.create', () => {
    it('create provides data of created offer including its id', async () => {
      const pc = PassCultureSDK(key);

      const [{ venues: [{ id: venueId }]}] = await pc.offers.offererVenues();

      const formatted = await formatEvent(
        pickEvent('animation-enfant-parure-de-terre-2615625'),
        { venueId, category: 'CINE_PLEIN_AIR' },
        { lang: 'fr' }
      );

      const { id, name } = await pc.offers.events.create(formatted);
      
      console.log('created event %s', id);
      expect(typeof id).toBe('number');
      expect(name).toBe(formatted.name);
    });
  });

  describe('offers.events.priceCategories.create', () => {
    it('create a price category for an event offer', async () => {
      const pc = PassCultureSDK(key);

      const { priceCategories } = await pc.offers.events(testEventId).priceCategories.create({
        priceCategories: [{
          label: `Prix ${(new Date()).getTime()}`,
          price: 0
        }],
      });

      expect(Array.isArray(priceCategories)).toBe(true);

      Object.keys(priceCategories[0]).forEach(k => {
        ['label', 'price', 'id'].includes(k);
      });
    });
  });

  describe('offers.events.priceCategories.patch', () => {
    it('patch a price category for an event offer', async () => {
      const pc = PassCultureSDK(key);

      const { priceCategories } = await pc.offers.events(testEventId).priceCategories.create({
        priceCategories: [{
          label: `Prix ${(new Date()).getTime()}`,
          price: 0
        }],
      });

      const priceCategory = priceCategories.pop();
      const patchedLabel = `Pas gratuit ${(new Date()).getTime()}`;

      const patchedPriceCategory = await pc.offers.events(testEventId).priceCategories(priceCategory.id).patch({
        label: patchedLabel,
        price: 12,
      });

      expect(patchedPriceCategory).toEqual({
        ...priceCategory,
        label: patchedLabel,
        price: 12
      });
    });
  });

  describe('offers.events.dates.list', () => {
    it('lists dates of an event offer', async () => {
      const pc = PassCultureSDK(key);

      const { dates } = await pc.offers.events(testEventId).dates.list();

      expect(Array.isArray(dates)).toBe(true);
    });
  });

  describe('offers.events.dates.create', () => {
    it('returns list of created dates', async () => {
      const pc = PassCultureSDK(key);

      const { priceCategories: [{
        id: priceCategoryId,
      }]} = await pc.offers.events(testEventId).get();

      const { dates } = await pc.offers.events(testEventId).dates.create({
        dates: [{
          beginningDatetime: '2024-09-17T14:00:00+02:00',
          bookingLimitDatetime: '2024-09-17T14:00:00+02:00',
          priceCategoryId,
          quantity: 3,
        }],
      });

      expect(Array.isArray(dates)).toBe(true);
    });

    it('booking limit is required', async () => {
      const pc = PassCultureSDK(key);

      const { priceCategories: [{
        id: priceCategoryId,
      }]} = await pc.offers.events(testEventId).get();

      const error = await pc.offers.events(testEventId).dates.create({
        dates: [{
          beginningDatetime: '2024-09-18T14:00:00+02:00',
          priceCategoryId,
          quantity: 3,
        }],
      }).catch(e => e);

      expect(error.response.data).toEqual({
        'dates.0.bookingLimitDatetime': [ 'Ce champ est obligatoire' ]
      });
    });

    it('booking limit can be the same as the beginningDateTime', async () => {
      const pc = PassCultureSDK(key);

      const { priceCategories: [{
        id: priceCategoryId,
      }]} = await pc.offers.events(testEventId).get();

      const { dates } = await pc.offers.events(testEventId).dates.create({
        dates: [{
          beginningDatetime: '2024-09-19T14:00:00+02:00',
          bookingLimitDatetime: '2024-09-19T14:00:00+02:00',
          priceCategoryId,
          quantity: 3,
        }],
      });

      expect(Array.isArray(dates)).toBe(true);
    });
  });

  describe('offers.events.dates.patch', () => {
    let pc;

    beforeAll(() => {
      pc = PassCultureSDK(key);
    });

    it('increment the quantity', async () => {
      const { dates: [date] } = await pc.offers.events(testEventId).dates.list();

      const dateAfterPatch = await pc.offers.events(testEventId).dates(date.id).patch({
        quantity: date.quantity + 1,
      }).then(r => r, e => e.response.data);

      expect(dateAfterPatch.quantity).toBe(date.quantity + 1);
    });

    it('set the quantity to 0', async () => {
      const { dates: [date] } = await pc.offers.events(testEventId).dates.list();

      const dateAfterPatch = await pc.offers.events(testEventId).dates(date.id).patch({
        quantity: 0,
      }).then(r => r, e => e);

      expect(dateAfterPatch.quantity).toBe(0);
    });
  });

  describe('offers.events.categories.list', () => {
    let pc;

    beforeAll(() => {
      pc = PassCultureSDK(key);
    });

    it('lists available categories', async () => {
      const { categories, related } = await pc.offers.events.categories.list();

      expect(categories[0]).toEqual({
        value: 'ATELIER_PRATIQUE_ART',
        label: 'Atelier, stage de pratique artistique',
        related: [],
      });

      expect(related.find(r => r.schema === 'MusicTypeEnum').options[0]).toEqual({ value: 'JAZZ-ACID_JAZZ', label: 'Jazz - Acid Jazz' });
    });
  });
});