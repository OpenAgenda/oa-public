import 'dotenv/config';
import PassCulture from '../';
import fixtures from './fixtures/cart.events.json';

const pickEvent = slug => fixtures.find(e => slug === e.slug);

const {
  PASS_API_KEY: key,
  PASS_SIREN: singleSiren,
  PASS_API_DOMAIN: api,
} = process.env;


describe('integrated', () => {
  let pc;
  beforeAll(() => {
    pc = PassCulture({ key, api });
  });

  describe('verifyAndCreateEventOffer', () => {
    it('created event offer returns PC created objects in eventOffer, priceCategories and dates keys', async () => {
      const event = pickEvent('visite-guidee-des-collections-5223531');
  
      const timingId = event.timings.map(t => new Date(t.begin).getTime()).pop();
  
      const result = await pc({ siren: [singleSiren] }).verifyAndCreateEventOffer(event, {
        venueId: 548,
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
        }, {
          timingId,
          priceCategoryIndex: 1,
          quantity: 6,
        }],
      });
  
      expect(Object.keys(result)).toEqual(['eventOffer', 'priceCategories', 'dates']);
    });
  });

  describe('getParameters', () => {
    it('gets available categories, related offers and offerer venues', async () => {
      const pcParams = await pc({ siren: [singleSiren] }).getParameters();

      expect(Object.keys(pcParams)).toEqual(['categories', 'related', 'offererVenues']);
    });
  });

});