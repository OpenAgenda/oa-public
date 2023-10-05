'use strict';

const {
  service: config,
} = require('../testconfig.sample');
const Service = require('..');
const fields = require('../lib/fields');

const fixtures = require('./fixtures');

describe('events - functional - get', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: config.imagePath,
      defaultImage: '//default/image/path.png',
    });
  });

  describe('simple get', () => {
    let event;

    beforeAll(async () => {
      event = await svc.get(80107389);
    });

    it('event is the response', () => {
      expect(event.uid).toBe(80107389);
    });

    it('image credits is placed in imageCredits field', () => {
      expect(event.imageCredits).toBe('MEL');
    });

    it(
      'image filename is placed in the image field under the key "filename"',
      () => {
        expect(event.image.filename).toBe('950de3a396df447dbb66364d036e0067.base.image.jpg');
      },
    );

    it('get by slug', async () => {
      expect(
        await svc.get({ slug: 'kara-okay-live_429424' }).then(e => e.title.fr),
      ).toBe('Kara Okay live');
    });

    it('identifier matching no event returns null', async () => {
      expect(
        await svc.get(679579696),
      ).toBeNull();
    });

    it('get on a soft-deleted event returns null', async () => {
      expect(await svc.get(44822046)).toBeNull();
    });

    it('registration data is a list of { type, value } objects', async () => {
      const { registration } = await svc.get({ slug: 'salon-science-en-livre' });
      expect(registration).toEqual([
        {
          value: 'https://www.eventbrite.fr/e/billets-salon-science-en-livre-122233558865',
          type: 'link',
        },
        { value: 'salon@scienceenlivre.org', type: 'email' },
      ]);
    });
  });

  describe('options', () => {
    it('includeFields to restrict to certain fields', async () => {
      const event = await svc.get(80107389, {
        includeFields: ['uid', 'title'],
      });

      expect(event).toEqual({
        uid: 80107389,
        title: {
          fr: 'ANNULÉ : Spectacle « Les ombres racontent : Kirikou et autres histoires »',
        },
      });
    });

    it('deleted true returns a soflty-deleted event', async () => {
      expect(
        await svc.get(44822046, { deleted: true }).then(e => e.uid),
      ).toBe(44822046);
    });

    it(
      'identifier matching no event with throwOnNotFound option set throws NotFoundError',
      async () => {
        expect(
          await svc.get(6789679673, { throwOnNotFound: true }).catch(e => e.message),
        ).toBe('Not found');
      },
    );

    it('image path is placed in base key of image field', async () => {
      const event = await svc.get(80107389, { limit: 1 });

      expect(typeof event.image.base).toBe('string');
    });

    it('detailed uses interfaces to fetch objects linked to event', async () => {
      const location = {
        uid: 16496612,
        name: 'Associated location',
      };

      const agenda = {
        uid: 89904399,
        title: 'Origin agenda',
      };

      const svcWithMockInterfaces = Service({
        knex: f.client,
        interfaces: {
          getOriginAgendas: async (_identifiers, _options) => [agenda],
          getLocations: async _identifiers => [location],
        },
      });

      const event = await svcWithMockInterfaces.get(80107389, { detailed: true });

      expect(event.location).toEqual(location);
      expect(event.agenda).toEqual(agenda);
    });

    it('html adds an html field with htmlized longDescrition', async () => {
      const event = await svc.get({ slug: 'les-contes-de-lhyper-climat' }, { html: true });

      expect(event.html).toEqual({
        fr: [
          '<p>Et que dire des petits cochons, des loups voraces, du petit Poucet et des ogres de nos forêts séculaires ? Face aux nouveaux enjeux du XXIe',
          'siècle, tout est à réinventer… Ludiques, parfois décalés et conçus sur',
          'la volonté de sensibiliser le public au réchauffement climatique, des contes et histoires traditionnels ont été revisités par Armel Richard dans un climat à +20°C. À partir de 6 ans.</p>\n',
        ].join('\n'),
      });
    });

    it('default access value is public', async () => {
      const publicFieldNames = fields.filter(field => field.read.includes('public')).map(field => field.field);

      const event = await svc.get({ slug: 'les-contes-de-lhyper-climat' });

      publicFieldNames.forEach(field => {
        expect(Object.keys(event).includes(field)).toBe(true);
      });
    });

    it('null credit and null image appear as null in events', async () => {
      expect(
        await svc.get(66724283).then(e => e.image),
      ).toBeNull();
    });

    it('if access is internal, internal fields are returned', async () => {
      const internalFieldNames = fields.filter(field => field.read.includes('internal')).map(field => field.field);

      const event = await svc.get({
        slug: 'les-contes-de-lhyper-climat',
      }, {
        access: 'internal',
      });

      internalFieldNames.forEach(field => {
        expect(Object.keys(event).includes(field)).toBe(true);
      });
    });

    it('default image is loaded if null is set as image filename', async () => {
      const event = await svc.get(9107612, {
        useDefaultImage: true,
      });

      expect(event.image).toEqual({ filename: 'path.png', base: '//default/image/' });
    });

    it('useDateHoursMinutesFormat', async () => {
      const event = await svc.get(9107612, {
        useDateHoursMinutesFormat: true,
      });

      expect(event.timings).toEqual([
        {
          begin: { date: '2019-09-14', hours: '10', minutes: '30' },
          end: { date: '2019-09-14', hours: '11', minutes: '30' },
        },
        {
          begin: { date: '2019-09-14', hours: '14', minutes: '30' },
          end: { date: '2019-09-14', hours: '15', minutes: '30' },
        },
      ]);
    });

    it('useLocationObjectFormat', async () => {
      const event = await svc.get(9107612, {
        useLocationObjectFormat: true,
      });

      expect('locationUid' in event).toBe(false);
      expect(event.location).toEqual({ uid: 63552532 });
    });
  });

  describe('lang option', () => {
    let event;

    beforeAll(async () => {
      event = await svc.get({ slug: 'festival-du-cinema-europeen' }, { lang: 'en', html: true });
    });

    it('main text fields are flattened', () => {
      ['title', 'description', 'longDescription', 'html'].forEach(field => {
        expect(typeof event[field]).toBe('string');
      });
    });

    it('flattened keywords default is empty array', () => {
      expect(event.keywords).toEqual([]);
    });

    it('by default, no fallback language is offered', async () => {
      const ev = await svc.get({
        slug: 'les-contes-de-lhyper-climat',
      }, { lang: 'en' });

      expect(ev.title).toBeUndefined();
    });

    it(
      'if useFallbackLang option is true, first available language is used',
      async () => {
        const ev = await svc.get({
          slug: 'les-contes-de-lhyper-climat',
        }, {
          lang: 'en',
          useFallbackLang: true,
        });

        expect(ev.title).toBe('« Les contes de l’hyper climat »');
      },
    );
  });

  describe('defaults', () => {
    it('links', async () => {
      const event = await svc.get({
        slug: 'les-contes-de-lhyper-climat',
      });

      expect(event.links).toEqual([]);
    });

    it('accessibility', async () => {
      const event = await svc.get({ slug: 'lectures-dafriques' });

      expect(event.accessibility).toEqual({
        mi: false,
        hi: false,
        pi: false,
        vi: false,
        ii: false,
      });
    });
  });

  describe('miscellaneous', () => {
    it(
      'when no min & max age is defined, age provides { min: null, max: null }',
      async () => {
        const eventHavingNullAgesInDB = await svc.get(80107389);
        const eventHavingEmptyObjectInAgeInDb = await svc.get(16687899);

        expect(eventHavingNullAgesInDB.age).toEqual({
          min: null,
          max: null,
        });

        expect(eventHavingEmptyObjectInAgeInDb.age).toEqual({
          min: null,
          max: null,
        });
      },
    );
  });
});
