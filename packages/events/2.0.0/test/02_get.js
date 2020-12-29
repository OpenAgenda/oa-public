'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');

describe('events - functional - get', function() {
  this.timeout(10000);

  const f = fixtures(config.mysql, config.schema);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: config.imagePath
    });
  });

  describe('simple get', () => {
    let event;

    before(async () => {
      event = await svc.get(80107389);
    });

    it('event is the response', () => {
      assert.equal(event.uid, 80107389);
    });

    it('image credits is placed in imageCredits field', () => {
      assert.equal(event.imageCredits, 'MEL');
    });

    it('image filename is placed in the image field', () => {
      assert.equal(event.image, '950de3a396df447dbb66364d036e0067.base.image.jpg');
    });

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

    it('identifier matching no event with throwOnNotFound option set throws NotFoundError', async () => {
      try {
        await svc.get(6789679673, { throwOnNotFound: true })
      } catch (error) {
        assert.equal(error.message, 'Not found');
        return;
      }

      throw new Error('should not reach here');
    });

    it('includeImagePath option adds path to image', async () => {
      assert.equal(
        await svc.get(80107389, { includeImagePath: true }).then(e => e.image),
        config.imagePath + '950de3a396df447dbb66364d036e0067.base.image.jpg'
      );
    });

    it('detailed uses interfaces to fetch objects linked to event', async () => {
      const location = {
        name: 'Associated location'
      };

      const agenda = {
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
      assert.equal(event.originAgenda, agenda);
    });

    it('html adds an html field with htmlized longDescrition', async () => {
      const event = await svc.get({ slug: 'les-contes-de-lhyper-climat' }, { html: true });

      assert.deepEqual(event.html, {
        fr: '<p>Et que dire des petits cochons, des loups voraces, du petit Poucet et des ogres de nos forêts séculaires ? Face aux nouveaux enjeux du XXIe\n' +
          'siècle, tout est à réinventer… Ludiques, parfois décalés et conçus sur\n' +
          'la volonté de sensibiliser le public au réchauffement climatique, des contes et histoires traditionnels ont été revisités par Armel Richard dans un climat à +20°C. À partir de 6 ans.</p>\n'
      });
    });

  });

});
