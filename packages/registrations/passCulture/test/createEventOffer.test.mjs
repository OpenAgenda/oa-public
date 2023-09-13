import 'dotenv/config';

import createEventOffer from '../lib/createEventOffer';
import PassCultureSDK from '../lib/PassCultureSDK.mjs';

import fixtures from './fixtures/cart.events.json' assert { type: 'json' };

const pickEvent = slug => fixtures.find(e => slug === e.slug);

const {
  PASS_API_KEY: key,
} = process.env;

if (!key) {
  throw new Error('PASS_API_KEY env var must be defined');
}

describe('createEventOffer', () => {
  let pc;
  let venueId;

  beforeAll(async () => {
    pc = PassCultureSDK(key);

    venueId = (await pc.offers.offererVenues())[0].venues[0].id;
  });

  it('created event offer returns PC created objects in eventOffer, priceCategories and dates keys', async () => {
    const result = await createEventOffer(
      pc,
      pickEvent('visite-guidee-des-collections-5223531'),
      {
        venueId,
        category: 'CINE_PLEIN_AIR',
        priceCategories: [{
          label: 'Tarif réduit',
          price: 8,
        }, {
          label: 'Plein tarif',
          price: 14
        }],
        dates: [{
          timingId: 1699801200000,
          priceCategoryIndex: 0,
          quantity: 3,
        }, {
          timingId: 1699801200000,
          priceCategoryIndex: 1,
          quantity: 6,
        }],
      }
    );

    expect(Object.keys(result)).toEqual(['eventOffer', 'priceCategories', 'dates'])
  });
});