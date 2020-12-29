'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');

describe('events - functional - list', function() {
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

  describe('simple list', () => {
    let events;

    before(async () => {
      events = await svc.list();
    });

    it('lists 20 items by default', () => {
      assert.equal(events.length, 20);
    });

  });

  describe('filters', () => {

    it('by locationUid', async () => {
      const {
        items: events,
        total
       } = await svc.list({ locationUid: 46457931 }, {}, { total: true });

       assert.equal(total, 6);
    });
  });

  describe('options', () => {

    it('includeFields', async () => {
      const events = await svc.list({}, {
        limit: 1
      }, {
        includeFields: ['uid', 'title']
      });

      assert.deepEqual(
        Object.keys(events[0]),
        ['uid', 'title']
      );
    });

    it('image path is placed in base key of image field', async () => {
      const events = await svc.list({}, { limit: 1 });

      assert.equal(typeof events[0].image.base, 'string');
    });

    it('total true returns total in result, events in items key', async () => {
      const {
        items,
        total
      } = await svc.list({}, {}, { total: true, draft: null });

      assert.equal(total, 673);
      assert.equal(items.length, 20);
    });

    it('draft true returns draft events only', async () => {
      const {
        items,
        total
      } = await svc.list({}, {}, { total: true, draft: true });

      assert.equal(total, 4);
    });

    it('if interfaces are set and detailed is true, events are decorated with location and origin agenda details', async () => {
      const location = {
        uid: 17687999,
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

      const events = await svc.list({}, { limit: 1 }, { detailed: true });

      assert.equal(events[0].location.uid, location.uid);
      assert.equal(events[0].originAgenda.uid, agenda.uid);
    });

    it('if html option is used, html variant of longDescription is placed in html field', async () => {
      const events = await svc.list({}, { limit: 1 }, { html: true });

      assert.deepEqual(
        events[0].html,
        {
          fr: '<p>La seconde édition du Livre Express régional se réinvente et se présente cette année sous la forme de quatre conférences en ligne, quatre arrêts sur quatre jours différents qui permettront à tous de découvrir le programme. <a href="https://docs.google.com/forms/d/e/1FAIpQLSdV6ulNE3Kbx1YAPPyCXx2ykYtHVZiqDluLv0FgAalj92HrPQ/viewform">Inscrivez-vous dès maintenant !</a>\n' +
            '<a href="http://www.ar2l-hdf.fr/le-livre-express-regional-se-reinvente-en-conference-en-ligne-actualite-931.html?fbclid=IwAR2jmorw3pUajIY1uJYzBQU_3CfURi8j5Of77d9dHNyEoM-p1wR6OVsHqRo">Découvrez le programme</a></p>\n'
        }
      );
    });

  });

});