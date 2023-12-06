import 'dotenv/config';
import { fileURLToPath } from 'node:url';

import PassCulture from '..';
import fixtures from './fixtures/cart.events.json';

const pickEvent = slug => fixtures.find(e => slug === e.slug);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const {
  PASS_API_KEY: key,
  PASS_SIREN: singleSiren,
  PASS_API_DOMAIN: api,
  GET_PARAMS_PASS_SIRENS: multiSiren,
  GET_PARAMS_PASS_API_DOMAIN: multiSirenApi,
  GET_PARAMS_PASS_API_KEY: multiSirenKey,
} = process.env;

describe('integrated', () => {
  let pc;
  beforeAll(() => {
    pc = PassCulture({ key, api }, { siren: singleSiren });
  });

  describe('validateAndCreateEventOffer', () => {
    let result;

    beforeAll(async () => {
      const event = pickEvent('visite-guidee-des-collections-5223531');
      const timingId = event.timings.map(t => new Date(t.begin).getTime()).pop();

      result = await pc.validateAndCreateEventOffer({
        ...event,
        image: {
          path: `${__dirname}/fixtures/image.jpg`,
        },
      }, {
        venueId: 548,
        bookingEmail: 'clem@oa.com',
        category: 'EVENEMENT_JEU',
        priceCategories: [{
          label: 'Tarif réduit',
          price: 8,
        }, {
          label: 'Plein tarif',
          price: 14,
        }],
        dates: [{
          timingId,
          priceCategoryIndex: 0,
          quantity: 3,
        }, {
          timingId,
          priceCategoryIndex: 1,
          quantity: 6,
        }],
        error: null,
      });
    });

    it('created event offer returns PC created objects in eventOffer, priceCategories and dates keys', () => {
      expect(
        Object.keys(result),
      ).toEqual([
        'eventOffer',
        'priceCategories',
        'dates',
        'errors',
      ]);
    });

    it('Created event offer has associated image', () => {
      expect(
        result.eventOffer.image.url.substr(0, 8),
      ).toBe('https://');
    });
  });

  describe('getParameters', () => {
    it('gets available categories, related offers and offerer venues', async () => {
      const pcParams = await pc.getParameters();

      expect(pcParams.offererVenues.length).toBe(1);

      expect(
        Object.keys(pcParams),
      ).toEqual(['categories', 'related', 'offererVenues']);
    });

    it('multiple sirens set returns matching multiple offererVenues', async () => {
      const pcWithMultiSiren = PassCulture({
        key: multiSirenKey,
        api: multiSirenApi,
      }, { siren: multiSiren.split(',') });

      const { offererVenues } = await pcWithMultiSiren.getParameters();

      expect(offererVenues.length).toBe(2);
    });
  });
});
