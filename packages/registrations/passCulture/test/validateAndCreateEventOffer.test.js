import 'dotenv/config';
import validateAndCreateEventOffer from '../validateAndCreateEventOffer.js';
import PassCultureSDK from '../lib/PassCultureSDK.js';

import fixtures from './fixtures/cart.events.json';

const pickEvent = slug => fixtures.find(e => slug === e.slug);

const {
  PASS_API_KEY: key,
  PASS_API_DOMAIN: api,
  PASS_SIREN: siren,
} = process.env;

if (!key) {
  throw new Error('PASS_API_KEY env var must be defined');
}

describe('validateAndCreateEventOffer', () => {
  let pc;
  let venueId;

  beforeAll(async () => {
    pc = PassCultureSDK({ api, key });

    venueId = (await pc.offers.offererVenues())[0].venues[0].id;
  });

  it('created event offer returns PC created objects in eventOffer, priceCategories and dates keys', async () => {
    const event = pickEvent('visite-guidee-des-collections-5223531');

    const timingId = event.timings.map(t => new Date(t.begin).getTime()).pop();

    const result = await validateAndCreateEventOffer(
      { pc, siren },
      { ...event, image: undefined },
      {
        venueId,
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        bookingContact: 'support@openagenda.com',
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
      },
    );

    expect(Object.keys(result)).toEqual([
      'eventOffer',
      'priceCategories',
      'dates',
      'errors',
    ]);
  });
});
