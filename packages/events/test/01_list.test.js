'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');
const fields = require('../lib/fields');

describe('events - functional - list', () => {
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

  describe('simple list', () => {
    let events;

    beforeAll(async () => {
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

    it('by mutliple locationUids', async () => {
      const {
        items: events,
        total
       } = await svc.list({ locationUid: [46457931, 36223087] }, {}, { total: true });

       assert.equal(total, 9);
    });

    it('by ownerUid', async () => {
      const {
        total
      } = await svc.list({ ownerUid: 96815475 }, {}, { total: true });

      assert.equal(total, 248);
    });

    it('by search', async () => {
      const {
        total
      } = await svc.list({ search: 'Salon' }, {}, { total: true });

      assert.equal(total, 10);
    });

    it('by createdAt', async () => {
      const {
        total
      } = await svc.list({ createdAt: { gte: '2020-09-10' } }, {}, { total: true });

      assert.equal(total, 19);
    });
  });

  describe('navigation', () => {

    it('with after and limit', async () => {
      const events = await svc.list({}, { limit: 10 });

      const {
        items: batch1,
        after: afterBatch1
      } = await svc.list({}, { after: 0, limit: 5 }, {
        useAfter: true
      });

      const {
        items: batch2,
      } = await svc.list({}, { after: afterBatch1, limit: 5 }, {
        useAfter: true
      });

      assert.equal(batch2[0].uid, events[5].uid);
    });

    it('order by updatedAt.desc', async () => {
      const events = await svc.list({}, { limit: 10, order: 'updatedAt.desc' });

      assert(events.reduce(({ ok, previous }, event) => {
        if (!ok || !previous) {
          return {
            ok,
            previous: event
          };
        }
        return {
          ok: previous.updatedAt > event.updatedAt,
          previous: event
        };
      }, { ok: true }).ok);
    });

  });

  describe('options', () => {

    it('events marked as deleted do not show in list results', async () => {
      const events = await svc.list({ uid: 46091044 }, {
        limit: 1
      });

      assert.equal(events.length, 0);
    });

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

    it('useDefaultImage', async () => {
      const events = await svc.list({ uid: 15822724 }, { limit: 1 }, {
        useDefaultImage: true,
        includeFields: ['slug', 'image']
      });

      assert.deepEqual(events[0].image, {
        filename: 'path.png',
        base: '//default/image/'
      });
    });

    it('imageAsLink', async () => {
      const events = await svc.list({ uid: 15822724 }, { limit: 1 }, {
        useDefaultImage: true,
        imageAsLink: true,
        includeFields: ['slug', 'image']
      });

      assert.equal(events[0].image, '//default/image/path.png');
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

      assert.equal(total, 662);
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

    it(
      'if interfaces are set and detailed is true, events are decorated with location and origin agenda details',
      async () => {
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
        assert.equal(events[0].agenda.uid, agenda.uid);
      }
    );

    it(
      'if html option is used, html variant of longDescription is placed in html field',
      async () => {
        const events = await svc.list({}, { limit: 1 }, { html: true });

        assert.deepEqual(
          events[0].html,
          {
            fr: '<p>Swift, Jonathan de son prénom. Ce nom vous dit quelque chose ? Bingo ! C’est bien l’auteur du livre Les voyages de Gulliver, écrit au début du XVIIIe siècle.L’histoire d’un marin échouant sur l’île de Lilliput. Par la magie d’un colossal changement d’échelle, il se transforme subitement en géant, capturé par des êtres pas plus hauts que 6 pouces. Transposées dans le monde actuel, les images de ce théâtre d’ombres et d’objets se combinent à la vidéo, pour une expédition merveilleuse où l’immense rejoint le minuscule.</p>\n<p><em>Atelier enfants-adultes &quot;Mon ombre est un autre&quot; :15 h, sur réservation Goûter et surprise : 16 h, 8 €</em></p>\n'
          }
        );
      }
    );

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