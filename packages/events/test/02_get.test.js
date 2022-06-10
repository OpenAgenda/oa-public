'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');
const fields = require('../lib/fields');

describe('events - functional - get', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: config.imagePath,
      defaultImage: '//default/image/path.png'
    });
  });

  describe('simple get', () => {
    let event;

    beforeAll(async () => {
      event = await svc.get(80107389);
    });

    it('event is the response', () => {
      assert.equal(event.uid, 80107389);
    });

    it('image credits is placed in imageCredits field', () => {
      assert.equal(event.imageCredits, 'MEL');
    });

    it(
      'image filename is placed in the image field under the key "filename"',
      () => {
        assert.equal(event.image.filename, '950de3a396df447dbb66364d036e0067.base.image.jpg');
      }
    );

    it('get by slug', async () => {
      assert.equal(
        await svc.get({ slug: 'kara-okay-live_429424' }).then(e => e.title.fr),
        'Kara Okay live'
      )
    });

    it('identifier matching no event returns null', async () => {
      assert.equal(
        await svc.get(679579696),
        null
      );
    });

    it('get on a soft-deleted event returns null', async () => {
      assert.equal(
        await svc.get(44822046),
        null
      );
    });
  });

  describe('options', () => {

    it('includeFields to restrict to certain fields', async () => {
      const event = await svc.get(80107389, {
        includeFields: ['uid', 'title']
      });

      assert.deepEqual(event, {
        uid: 80107389,
        title: {
          fr: 'ANNULÉ : Spectacle « Les ombres racontent : Kirikou et autres histoires »'
        }
      });
    });

    it('deleted true returns a soflty-deleted event', async () => {
      assert.equal(
        await svc.get(44822046, { deleted: true }).then(e => e.uid),
        44822046
      );
    });

    it(
      'identifier matching no event with throwOnNotFound option set throws NotFoundError',
      async () => {
        try {
          await svc.get(6789679673, { throwOnNotFound: true })
        } catch (error) {
          assert.equal(error.message, 'Not found');
          return;
        }

        throw new Error('should not reach here');
      }
    );

    it('image path is placed in base key of image field', async () => {
      const event = await svc.get(80107389, { limit: 1 });

      assert.equal(typeof event.image.base, 'string');
    });

    it('detailed uses interfaces to fetch objects linked to event', async () => {
      const location = {
        uid: 16496612,
        name: 'Associated location'
      };

      const agenda = {
        uid: 89904399,
        title: 'Origin agenda'
      };

      const svc = Service({
        knex: f.client,
        interfaces: {
          getOriginAgendas: async (identifiers, options) => [agenda],
          getLocations: async identifiers => [location]
        }
      });

      const event = await svc.get(80107389, { detailed: true });

      assert.equal(event.location, location);
      assert.equal(event.agenda, agenda);
    });

    it('html adds an html field with htmlized longDescrition', async () => {
      const event = await svc.get({ slug: 'les-contes-de-lhyper-climat' }, { html: true });

      assert.deepEqual(event.html, {
        fr: '<p>Et que dire des petits cochons, des loups voraces, du petit Poucet et des ogres de nos forêts séculaires ? Face aux nouveaux enjeux du XXIe\n' +
          'siècle, tout est à réinventer… Ludiques, parfois décalés et conçus sur\n' +
          'la volonté de sensibiliser le public au réchauffement climatique, des contes et histoires traditionnels ont été revisités par Armel Richard dans un climat à +20°C. À partir de 6 ans.</p>\n'
      });
    });

    it('default access value is public', async () => {
      const publicFieldNames = fields.filter(f => f.read.includes('public')).map(f => f.field);

      const event = await svc.get({ slug: 'les-contes-de-lhyper-climat' });

      publicFieldNames.forEach(field => {
        assert(Object.keys(event).includes(field));
      });
    });

    it('null credit and null image appear as null in events', async () => {
      assert.equal(await svc.get(66724283).then(e => e.image), undefined);
    });

    it('if access is internal, internal fields are returned', async () => {
      const internalFieldNames = fields.filter(f => f.read.includes('internal')).map(f => f.field);

      const event = await svc.get({
        slug: 'les-contes-de-lhyper-climat'
      }, {
        access: 'internal'
      });

      internalFieldNames.forEach(field => {
        assert(Object.keys(event).includes(field));
      });
    });

    it('default image is loaded if null is set as image filename', async () => {
      const event = await svc.get(9107612, {
        useDefaultImage: true
      });

      assert.deepEqual(event.image, { filename: 'path.png', base: '//default/image/' });
    });

    it('useDateHoursMinutesFormat', async () => {
      const event = await svc.get(9107612, {
        useDateHoursMinutesFormat: true
      });

      assert.deepEqual(event.timings, [
        {
          begin: { date: '2019-09-14', hours: '10', minutes: '30' },
          end: { date: '2019-09-14', hours: '11', minutes: '30' }
        },
        {
          begin: { date: '2019-09-14', hours: '14', minutes: '30' },
          end: { date: '2019-09-14', hours: '15', minutes: '30' }
        }
      ]);
    });

    it('useLocationObjectFormat', async () => {
      const event = await svc.get(9107612, {
        useLocationObjectFormat: true
      });

      assert.equal('locationUid' in event, false);
      assert.deepEqual(event.location, { uid: 63552532 });
    })

  });

  describe('lang option', () => {
    let event;

    beforeAll(async () => {
      event = await svc.get({ slug: 'festival-du-cinema-europeen' }, { lang: 'en', html: true });
    });

    it('main text fields are flattened', () => {
      ['title', 'description', 'longDescription', 'html'].forEach(f => {
        assert.equal(typeof event[f], 'string');
      });
    });

    it('flattened keywords default is empty array', () => {
      assert.deepEqual(event.keywords, []);
    });

    it('by default, no fallback language is offered', async () => {
      const event = await svc.get({
        slug: 'les-contes-de-lhyper-climat'
      }, { lang: 'en' });

      assert.equal(event.title, undefined);
    });

    it(
      'if useFallbackLang option is true, first available language is used',
      async () => {
        const event = await svc.get({
          slug: 'les-contes-de-lhyper-climat'
        }, {
          lang: 'en',
          useFallbackLang: true
        });

        assert.equal(event.title, '« Les contes de l’hyper climat »');
      }
    );
  });

  describe('defaults', () => {

    it('links', async () => {
      const event = await svc.get({
        slug: 'les-contes-de-lhyper-climat'
      });

      assert.deepEqual(event.links, []);
    });

    it('accessibility', async () => {
      const event = await svc.get({ slug: 'lectures-dafriques' });

      assert.deepEqual(event.accessibility, {
        mi: false,
        hi: false,
        pi: false,
        vi: false,
        ii: false
      });
    });

  });

  describe('miscellaneous', () => {
    it(
      'when no min & max age is defined, age provides { min: null, max: null }',
      async () => {
        const eventHavingNullAgesInDB = await svc.get(80107389);
        const eventHavingEmptyObjectInAgeInDb = await svc.get(16687899);

        assert.deepEqual(eventHavingNullAgesInDB.age, {
          min: null,
          max: null
        });
        
        assert.deepEqual(eventHavingEmptyObjectInAgeInDb.age, {
          min: null,
          max: null
        });
      }
    );
  });
});
