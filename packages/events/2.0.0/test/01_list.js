'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');
const fields = require('../lib/fields');

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

  describe('navigation', () => {

    it('with after and limit', async () => {
      const events = await svc.list({}, { limit: 10 });

      const {
        items: batch1,
        after: afterBatch1
      } = await svc.list({}, { after: 0, limit: 5 });

      const {
        items: batch2,
      } = await svc.list({}, { after: afterBatch1, limit: 5 });

      assert.equal(batch2[0].uid, events[5].uid);
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

    it('lang option flatten multilingual fields', async () => {
      const event = await svc.list({ uid: 80378817 }, {}, {
        lang: 'fr',
        html: true
      }).then(r => r.pop());

      ['title', 'description', 'longDescription', 'html'].forEach(f => {
        assert.equal(typeof event[f], 'string');
      });
    });

    it('if interfaces are set and detailed is true, events are decorated with location and origin agenda details', async () => {
      const location = {
        uid: 51971567,
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
          fr: '<p>Swift, Jonathan de son prénom. Ce nom vous dit quelque chose ? Bingo ! C’est bien l’auteur du livre Les voyages de Gulliver, écrit au début du XVIIIe siècle.L’histoire d’un marin échouant sur l’île de Lilliput. Par la magie d’un colossal changement d’échelle, il se transforme subitement en géant, capturé par des êtres pas plus hauts que 6 pouces. Transposées dans le monde actuel, les images de ce théâtre d’ombres et d’objets se combinent à la vidéo, pour une expédition merveilleuse où l’immense rejoint le minuscule.</p>\n<p><em>Atelier enfants-adultes &quot;Mon ombre est un autre&quot; :15 h, sur réservation Goûter et surprise : 16 h, 8 €</em></p>\n'
        }
      );
    });

    it('if access is internal, internal fields are returned', async () => {
      const internalFieldNames = fields.filter(f => f.read.includes('internal')).map(f => f.field);

      const event = await svc.list({}, {
        limit: 1
      }, {
        access: 'internal'
      }).then(r => r[0]);

      internalFieldNames.forEach(field => {
        assert(Object.keys(event).includes(field));
      });
    });

  });

});