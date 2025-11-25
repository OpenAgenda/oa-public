import 'dotenv/config';

import formatEvent from '../lib/formatEvent.js';
import PassCultureSDK from '../lib/PassCultureSDK.js';

import fixtures from './fixtures/cart.events.json';

const pickEvent = (slug) => fixtures.find((e) => slug === e.slug);

const { PASS_API_KEY: key, PASS_API_DOMAIN: api } = process.env;

if (!key) {
  throw new Error(
    'PASS_API_KEY /* and PASS_TEST_EVENT_ID */ env vars must be defined',
  );
}

describe('PassCultureSDK', () => {
  let testEventId;
  let testEventPCId;

  beforeAll(async () => {
    const pc = PassCultureSDK({ key, api });

    const [
      {
        venues: [{ id: venueId }],
      },
    ] = await pc.offers.offererVenues();
    const formatted = await formatEvent(
      pickEvent('animation-enfant-parure-de-terre-2615625'),
      { venueId, category: 'CINE_PLEIN_AIR' },
      { lang: 'fr' },
    );

    const { id } = await pc.offers.events.create(formatted);
    testEventId = id;

    const { priceCategories } = await pc.offers
      .events(testEventId)
      .priceCategories.create({
        priceCategories: [
          {
            label: `Prix ${new Date().getTime()}`,
            price: 0,
          },
        ],
      });
    testEventPCId = priceCategories[0].id;

    await pc.offers.events(testEventId).dates.create({
      dates: [
        {
          beginningDatetime: '2034-09-17T14:00:00+02:00',
          bookingLimitDatetime: '2034-09-17T14:00:00+02:00',
          priceCategoryId: testEventPCId,
          quantity: 3,
        },
      ],
    });
  });

  describe('offers.offererVenues', () => {
    let items;

    beforeAll(async () => {
      const pc = PassCultureSDK({ key, api });

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
      ['id', 'name', 'siren'].forEach((k) =>
        expect(Object.keys(offerer).includes(k)).toBe(true));
    });

    it('the venues key of an item is a list of venues', () => {
      const [{ venues }] = items;

      expect(Array.isArray(venues)).toBe(true);
    });

    it('each venue contains an id, a legal name, a location and a siret among other values', () => {
      const [
        {
          venues: [venue],
        },
      ] = items;

      ['id', 'legalName', 'siret', 'location'].forEach((k) =>
        expect(Object.keys(venue).includes(k)).toBe(true));
    });
  });

  describe('offers.addresses', () => {
    let response;
    let pc;
    beforeAll(async () => {
      pc = PassCultureSDK({ key, api });
    });

    it('create', async () => {
      const created = await pc.offers.addresses.create({
        city: 'Paris',
        latitude: 48.86696,
        longitude: 2.31014,
        postalCode: '75001',
        street: '182 Rue Saint-Honoré',
      });
      expect(created).toMatchObject({
        city: 'Paris',
        postalCode: '75001',
        street: '182 Rue Saint-Honoré',
      });
      expect(typeof created.id).toBe('number');
      expect(typeof created.latitude).toBe('number');
      expect(typeof created.longitude).toBe('number');
    });

    it('create err postalcode', async () => {
      let err;
      const postalCode = '67201';
      const city = 'Strasbourg';
      try {
        await pc.offers.addresses.create({
          city: 'Strasbourg',
          latitude: 48.578651,
          longitude: 7.70854,
          postalCode: '67201',
          street: 'Quartier de l`Elsau',
        });
      } catch (error) {
        const errorData = await error.response.json();
        const [firstError] = errorData.__root__;
        err = firstError;
      }
      expect(err).toStrictEqual(
        `No municipality found for \`city=${city}\` and \`postalCode=${postalCode}\``,
      );
    });

    it('search', async () => {
      response = await pc.offers.addresses.search({
        city: 'Paris',
        postalCode: '75001',
        street: '182 Rue Saint-Honoré',
      });
      expect(response.addresses).toStrictEqual([
        {
          banId: '75101_8635_00182',
          city: 'Paris',
          id: 1544,
          latitude: 48.8624,
          longitude: 2.3389,
          postalCode: '75001',
          street: '182 Rue Saint-Honoré',
        },
        {
          banId: null,
          city: 'Paris',
          id: 1764,
          latitude: 48.86696,
          longitude: 2.31014,
          postalCode: '75001',
          street: '182 Rue Saint-Honoré',
        },
      ]);
    });

    it('search error', async () => {
      let error;
      try {
        await pc.offers.addresses.search({
          city: 'Strasbourg',
          postalCode: 67201, // postal code is invalid here
          street: '15 place André Maurois, 67200 Strasbourg',
        });
      } catch (e) {
        error = e;
      }
      expect(error.response.status).toBe(400);
      expect(await error.response.json()).toEqual({
        __root__: [
          'No municipality found for `city=Strasbourg` and `postalCode=67201`',
        ],
      });
    });

    it('create error', async () => {
      let error;
      try {
        await pc.offers.addresses.create({
          city: 'Strasbourg',
          latitude: 48.591836,
          longitude: 7.697631,
          postalCode: 67201,
          street: '15 place André Maurois, 67200 Strasbourg',
        });
      } catch (e) {
        error = e;
      }
      expect(error.response.status).toBe(400);
      expect(await error.response.json()).toEqual({
        __root__: [
          'No municipality found for `city=Strasbourg` and `postalCode=67201`',
        ],
      });
    });

    it('get', async () => {
      // First create an address to get a valid ID
      const created = await pc.offers.addresses.create({
        city: 'Paris',
        latitude: 48.86696,
        longitude: 2.31014,
        postalCode: '75001',
        street: '182 Rue Saint-Honoré',
      });

      // Test getting the address by ID
      const retrieved = await pc.offers.addresses(created.id).get();

      expect(retrieved).toMatchObject({
        id: created.id,
        city: 'Paris',
        postalCode: '75001',
        street: '182 Rue Saint-Honoré',
      });
      expect(typeof retrieved.latitude).toBe('number');
      expect(typeof retrieved.longitude).toBe('number');
    });
  });

  describe('offers.events', () => {
    let response;

    beforeAll(async () => {
      const pc = PassCultureSDK({ key, api });

      const offererVenues = await pc.offers.offererVenues();

      response = await pc.offers.events.list({
        // venueId is not optional
        venueId: offererVenues[0].venues[1].id,
      });
    });

    it('response provides an events list and a pagination object', () => {
      Object.keys(response).forEach((k) =>
        expect(['events', 'pagination'].includes(k)).toBe(true));
    });
  });

  describe('offers.events.get', () => {
    let event;

    beforeAll(async () => {
      const pc = PassCultureSDK({ key, api });

      event = await pc.offers.events(23808).get();
    });

    it('event has a name', () => {
      expect(Object.keys(event).includes('name')).toBe(true);
    });

    it('list price categories is provided in response', () => {
      expect(Array.isArray(event.priceCategories)).toBe(true);
    });
  });

  describe('offers.events.create', () => {
    it('create provides data of created offer including its id', async () => {
      const pc = PassCultureSDK({ key, api });

      const [
        {
          venues: [{ id: venueId }],
        },
      ] = await pc.offers.offererVenues();
      const formatted = await formatEvent(
        pickEvent('animation-enfant-parure-de-terre-2615625'),
        { venueId, category: 'CINE_PLEIN_AIR' },
        { lang: 'fr' },
      );

      const { id, name } = await pc.offers.events.create(formatted);

      expect(typeof id).toBe('number');
      expect(name).toBe(formatted.name);
    });

    it('create offer with addresses', async () => {
      const pc = PassCultureSDK({ key, api });

      const [
        {
          venues: [{ id: venueId }],
        },
      ] = await pc.offers.offererVenues();
      const created = await pc.offers.addresses.create({
        city: 'Paris',
        latitude: 48.86696,
        longitude: 2.31014,
        postalCode: '75001',
        street: '182 Rue Saint-Honoré',
      });

      const formatted = await formatEvent(
        pickEvent('animation-enfant-parure-de-terre-2615625'),
        { venueId, category: 'CINE_PLEIN_AIR', addressId: created.id },
        { lang: 'fr' },
      );

      const { id, name, location } = await pc.offers.events.create(formatted);
      expect(location.addressId).toBe(created.id);
      expect(typeof id).toBe('number');
      expect(name).toBe(formatted.name);
    });

    it('create Concert without sub', async () => {
      let err;
      const pc = PassCultureSDK({ key, api });

      const [
        {
          venues: [{ id: venueId }],
        },
      ] = await pc.offers.offererVenues();
      const formatted = await formatEvent(
        pickEvent('animation-enfant-parure-de-terre-2615625'),
        { venueId, category: 'CONCERT' },
        { lang: 'fr' },
      );

      try {
        /* const { id, name } = */ await pc.offers.events.create(formatted);
      } catch (error) {
        err = await error.response.json();
      }
      expect(err).toEqual({
        'categoryRelatedFields.CONCERT_create.musicType': ['field required'],
      });
    });
  });

  describe('offers.events.patch', () => {
    let id;
    let pc;
    let image;
    beforeAll(async () => {
      pc = PassCultureSDK({ key, api });
      const [
        {
          venues: [{ id: venueId }],
        },
      ] = await pc.offers.offererVenues();

      const formatted = await formatEvent(
        pickEvent('animation-enfant-parure-de-terre-2615625'),
        { venueId, category: 'CINE_PLEIN_AIR', itemCollectionDetails: 'test' },
        { lang: 'fr' },
      );

      const resp = await pc.offers.events.create(formatted);
      id = resp.id;
      image = resp.image;
    });

    it('patch updates the event description', async () => {
      const resp = await pc.offers.events(id).patch({ description: 'test' });
      expect(resp.description).toBe('test');
    });

    it('patch updates the event itemCollectionDetails', async () => {
      const resp = await pc.offers
        .events(id)
        .patch({ itemCollectionDetails: 'patched' });
      expect(resp.itemCollectionDetails).toBe('patched');
    });

    it('patch updates the event duration', async () => {
      const resp = await pc.offers.events(id).patch({ eventDuration: 120 });
      expect(resp.eventDuration).toBe(120);
    });

    it('patch updates the event bookingContact', async () => {
      const resp = await pc.offers
        .events(id)
        .patch({ bookingContact: 'clem@oa.com' });
      expect(resp.bookingContact).toBe('clem@oa.com');
    });

    it('patch updates the event bookingEmail', async () => {
      const resp = await pc.offers
        .events(id)
        .patch({ bookingEmail: 'clem@oa.com' });
      expect(resp.bookingEmail).toBe('clem@oa.com');
    });

    it('patch updates the event enableDoubleBookings', async () => {
      const resp = await pc.offers
        .events(id)
        .patch({ enableDoubleBookings: true });
      expect(resp.enableDoubleBookings).toBeTruthy();
    });

    it('patch updates the event accessibility', async () => {
      const accessibility = {
        audioDisabilityCompliant: true,
        mentalDisabilityCompliant: true,
        motorDisabilityCompliant: true,
        visualDisabilityCompliant: true,
      };
      const resp = await pc.offers.events(id).patch({ accessibility });
      expect(resp.accessibility).toStrictEqual(accessibility);
    });

    it('patch updates the event image', async () => {
      const formated = await formatEvent(pickEvent('mohamed-bourouissa'), {
        lang: 'fr',
      });
      const resp = await pc.offers.events(id).patch({ image: formated.image });
      expect(resp.image.credit).toBeNull();
      expect(resp.image.url !== image.url).toBeTruthy();
    });

    it('patch updates the event isActive', async () => {
      const resp = await pc.offers.events(id).patch({ isActive: false });
      expect(['INACTIVE', 'DRAFT'].includes(resp.status)).toBe(true);
    });

    it('patch error on update the event name', async () => {
      let err;
      try {
        await pc.offers.events(id).patch({ extraProp: 'test' });
      } catch (error) {
        err = error;
      }
      expect(await err.response.json()).toEqual({
        extraProp: ['extra fields not permitted'],
      });
    });

    it('patch error on update the event hasTicket', async () => {
      let err;
      try {
        await pc.offers.events(id).patch({ hasTicket: false });
      } catch (error) {
        err = error;
      }
      expect(await err.response.json()).toEqual({
        hasTicket: ['extra fields not permitted'],
      });
    });

    it('patch error on update event categoryRelatedFields.category', async () => {
      let err;
      const categoryRelatedFields = {
        category: 'CONCOURS',
        author: null,
        visa: null,
        stageDirector: null,
      };
      try {
        await pc.offers.events(id).patch({ categoryRelatedFields });
      } catch (error) {
        err = error;
      }
      expect(await err.response.json()).toEqual({
        'categoryRelatedFields.category': ['The category cannot be changed'],
      });
    });

    it('patch updates event categoryRelatedFields.author', async () => {
      const categoryRelatedFields = {
        category: 'CINE_PLEIN_AIR',
        author: 'me',
        visa: null,
        stageDirector: null,
      };

      const resp = await pc.offers.events(id).patch({ categoryRelatedFields });
      expect(resp.categoryRelatedFields).toStrictEqual(categoryRelatedFields);
    });

    it('(NEW can now) patch updates event venue', async () => {
      const offererVenues = await pc.offers.offererVenues();
      const fetchedOffer1 = await pc.offers.events(id).get();
      const location = {
        type: 'physical',
        venueId: offererVenues[0].venues[1].id,
      };

      const offer = await pc.offers.events(id).patch({ location });
      const fetchedOffer = await pc.offers.events(id).get();
      console.log(
        offer.location,
        fetchedOffer1.location,
        fetchedOffer.location,
        offererVenues[0].venues[1].id,
      );
      expect(offer.location.venueId).toBe(offererVenues[0].venues[1].id);
    });
  });

  describe('offers.events.priceCategories.create', () => {
    it('create a price category for an event offer', async () => {
      const pc = PassCultureSDK({ key, api });

      const { priceCategories } = await pc.offers
        .events(testEventId)
        .priceCategories.create({
          priceCategories: [
            {
              label: `Prix 2 ${new Date().getTime()}`,
              price: 0,
            },
          ],
        });

      expect(Array.isArray(priceCategories)).toBe(true);

      Object.keys(priceCategories[0]).forEach((k) => {
        ['label', 'price', 'id'].includes(k);
      });
    });

    it('failintg to create a price category for an event offer', async () => {
      const pc = PassCultureSDK({ key, api });
      let err;
      try {
        await pc.offers.events(testEventId).priceCategories.create({
          priceCategories: [
            {
              label: `Prix 2 ${new Date().getTime()}`,
              price: 3000000,
            },
            {
              label: `Prix 3 ${new Date().getTime()}`,
              price: 3000000,
            },
          ],
        });
      } catch (error) {
        // console.log(error);
        err = error;
      }

      expect(!!err).toBe(true);
    });
  });

  describe('offers.events.priceCategories.patch', () => {
    it('patch a price category for an event offer', async () => {
      const pc = PassCultureSDK({ key, api });

      const { priceCategories } = await pc.offers
        .events(testEventId)
        .priceCategories.create({
          priceCategories: [
            {
              label: `Prix ${new Date().getTime()}`,
              price: 0,
            },
          ],
        });

      const priceCategory = priceCategories.pop();
      const patchedLabel = `Pas gratuit ${new Date().getTime()}`;
      let patchedPriceCategory;
      try {
        patchedPriceCategory = await pc.offers
          .events(testEventId)
          .priceCategories(priceCategory.id)
          .patch({
            label: patchedLabel,
            price: 12,
          });
      } catch (error) {
        console.log('error', await error.response.json());
      }

      expect(patchedPriceCategory).toEqual({
        ...priceCategory,
        label: patchedLabel,
        price: 12,
      });
    });
  });

  describe('offers.events.dates.list', () => {
    it('lists dates of an event offer', async () => {
      const pc = PassCultureSDK({ key, api });

      const { dates } = await pc.offers.events(testEventId).dates.list();
      expect(Array.isArray(dates)).toBe(true);
    });
  });

  describe('offers.events.bookings.list', () => {
    it('empty', async () => {
      const pc = PassCultureSDK({ key, api });

      const { bookings } = await pc.offers.events(testEventId).bookings.list();
      expect(bookings).toStrictEqual([]);
    });
  });

  describe('offers.events.dates.create', () => {
    it('returns list of created dates', async () => {
      const pc = PassCultureSDK({ key, api });

      const {
        priceCategories: [{ id: priceCategoryId }],
      } = await pc.offers.events(testEventId).get();

      const { dates } = await pc.offers.events(testEventId).dates.create({
        dates: [
          {
            beginningDatetime: '2034-09-17T14:00:00+02:00',
            bookingLimitDatetime: '2034-09-17T14:00:00+02:00',
            priceCategoryId,
            quantity: 3,
          },
        ],
      });

      expect(Array.isArray(dates)).toBe(true);
    });

    it('booking limit is required', async () => {
      const pc = PassCultureSDK({ key, api });

      const {
        priceCategories: [{ id: priceCategoryId }],
      } = await pc.offers.events(testEventId).get();

      const error = await pc.offers
        .events(testEventId)
        .dates.create({
          dates: [
            {
              beginningDatetime: '2034-09-18T14:00:00+02:00',
              priceCategoryId,
              quantity: 3,
            },
          ],
        })
        .catch((e) => e);

      expect(await error.response.json()).toEqual({
        'dates.0.bookingLimitDatetime': ['field required'],
      });
    });

    it('booking limit can be the same as the beginningDateTime', async () => {
      const pc = PassCultureSDK({ key, api });

      const {
        priceCategories: [{ id: priceCategoryId }],
      } = await pc.offers.events(testEventId).get();

      const { dates } = await pc.offers.events(testEventId).dates.create({
        dates: [
          {
            beginningDatetime: '2034-09-19T14:00:00+02:00',
            bookingLimitDatetime: '2034-09-19T14:00:00+02:00',
            priceCategoryId,
            quantity: 3,
          },
        ],
      });

      expect(Array.isArray(dates)).toBe(true);
    });
  });

  describe('offers.events.dates.patch', () => {
    let pc;

    beforeAll(() => {
      pc = PassCultureSDK({ key, api });
    });

    it('increment the quantity', async () => {
      const {
        dates: [date],
      } = await pc.offers.events(testEventId).dates.list();

      const dateAfterPatch = await pc.offers
        .events(testEventId)
        .dates(date.id)
        .patch({
          quantity: date.quantity + 1,
        })
        .then(
          (r) => r,
          (e) => e.response.json(),
        );

      expect(dateAfterPatch.quantity).toBe(date.quantity + 1);
    });

    it('set the quantity to 0', async () => {
      const {
        dates: [date],
      } = await pc.offers.events(testEventId).dates.list();

      const dateAfterPatch = await pc.offers
        .events(testEventId)
        .dates(date.id)
        .patch({
          quantity: 0,
        })
        .then(
          (r) => r,
          (e) => e,
        );

      expect(dateAfterPatch.quantity).toBe(0);
    });

    it('can change price category', async () => {
      const {
        dates: [date],
      } = await pc.offers.events(testEventId).dates.list();

      const { priceCategories } = await pc.offers
        .events(testEventId)
        .priceCategories.create({
          priceCategories: [
            {
              label: `Prix 3 ${new Date().getTime()}`,
              price: 3,
            },
          ],
        });

      const resp = await pc.offers.events(testEventId).dates(date.id).patch({
        priceCategoryId: priceCategories[0].id,
      });
      expect(resp.priceCategory.id).toBe(priceCategories[0].id);
    });

    it('can change beginningDateTime', async () => {
      const {
        dates: [date],
      } = await pc.offers.events(testEventId).dates.list();

      const resp = await pc.offers.events(testEventId).dates(date.id).patch({
        beginningDatetime: '2034-09-27T14:00:00+02:00',
      });

      expect(new Date(resp.beginningDatetime)).toStrictEqual(
        new Date('2034-09-27T14:00:00+02:00'),
      );
    });
  });

  describe('offers.events.dates.delete', () => {
    let pc;

    beforeAll(() => {
      pc = PassCultureSDK({ key, api });
    });

    it('deleted date does not appear in list anymore', async () => {
      const {
        dates: [date],
      } = await pc.offers.events(testEventId).dates.list();
      await pc.offers.events(testEventId).dates(date.id).delete();
      const { dates } = await pc.offers.events(testEventId).dates.list();
      expect(dates.map((d) => d.id).includes(date.id)).toBeFalsy();
    });
  });

  describe('offers.events.categories.list', () => {
    let pc;

    beforeAll(() => {
      pc = PassCultureSDK({ key, api });
    });

    it('lists available categories', async () => {
      const { categories, related } = await pc.offers.events.categories.list();

      expect(categories[0]).toEqual({
        value: 'ATELIER_PRATIQUE_ART',
        label: 'Atelier, stage de pratique artistique',
        related: [],
      });

      expect(
        related.find((r) => r.schema === 'MusicTypeEnum').options[0],
      ).toEqual({
        value: 'JAZZ-ACID_JAZZ',
        label: 'Jazz - Acid Jazz',
      });
    });
  });
  /*  describe('test on booked date', () => {
    let pc;

    beforeAll(() => {
      pc = PassCultureSDK({ key, api });
    });

    it('can delete booked date', async () => {
      // for this test to work comment the delete part then go to https://integration.passculture.app/offre/66864 and reserve a date
      let resp;
      let { dates: [date] } = await pc.offers.events(66864).dates.list();
      if (!date) {
        console.log('create date');
        const {
          priceCategories: [{
            id: priceCategoryId,
          }],
        } = await pc.offers.events(66864).get();

        const { dates } = await pc.offers.events(66864).dates.create({
          dates: [{
            beginningDatetime: '2027-09-19T14:00:00+02:00',
            bookingLimitDatetime: '2027-09-19T14:00:00+02:00',
            priceCategoryId,
            quantity: 3,
          }],
        });
        console.log('created', dates);
        [date] = dates;
      } else {
        console.log(date);
        resp = await pc.offers.events(66864).dates(date.id).delete();
        console.log(resp);
      }
      expect(resp).toBe('');
      expect(date).toBeDefined();
    });

    it('can update booked date', async () => {
      let { dates: [date] } = await pc.offers.events(66864).dates.list();
      console.log('date', date);
      if (!date) {
        console.log('create date');
        const {
          priceCategories: [{
            id: priceCategoryId,
          }],
        } = await pc.offers.events(66864).get();

        const { dates } = await pc.offers.events(66864).dates.create({
          dates: [{
            beginningDatetime: '2027-09-19T14:00:00+02:00',
            bookingLimitDatetime: '2027-09-19T14:00:00+02:00',
            priceCategoryId,
            quantity: 3,
          }],
        });
        console.log('created', dates);
        [date] = dates;
      }
      const resp = await pc.offers.events(66864).dates(date.id).patch({
        beginningDatetime: '2028-09-27T14:00:00+02:00',
      });

      expect(new Date(resp.beginningDatetime)).toStrictEqual(new Date('2028-09-27T14:00:00+02:00'));
    });
  }); */
});
