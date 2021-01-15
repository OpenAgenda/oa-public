'use strict';

const _ = require('lodash');
const assert = require('assert');
const legacySet = require('../lib/legacy/set');
const legacyRemove = require('../lib/legacy/remove');
const {
  baseTransform
} = legacySet

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');
const { createECDH } = require('crypto');

const events = {
  'petites-boites-a-musique': require('./fixtures/petites-boites-a-musique.json'),
  'ventes-de-velos-d-occasion-a-lambersart': require('./fixtures/ventes-de-velos-d-occasion-a-lambersart.json'),
  'indoor-de-paris-cso-pro-1': require('./fixtures/indoor-de-paris-cso-pro-1.json')
};

const f = fixtures(config.mysql, config.schema);

describe('legacy', () => {

  describe('setFromLegacy', () => {
    let svc;
    let result;

    const eventUid = 27434489;

    before(async () => {
      await f.load();

      svc = Service({
        knex: f.client
      });
    });

    before(async () => {
      result = await svc.setFromLegacy({ uid: eventUid });
    });

    it('create/update payload deriving from event is part of response', () => {
      assert.deepEqual(result.event, events['indoor-de-paris-cso-pro-1']);
    });

    it('operation is given in response', () => {
      assert.equal(result.operation, 'create');
    });

    it('event is created', async () => {
      assert.equal(result.response.uid, result.event.uid);
    });

  });
  
  describe('legacySet', () => {
  
    describe('create', () => {
      before(async () => {
        await f.load();
      });
  
      describe('simple case', () => {
        let result, legacyEventId;
        before(async () => {
          result = await legacySet(f.client, events['petites-boites-a-musique']);
          legacyEventId = result.eventId;
        });
  
        it('result contains event legacy id', () => {
          assert.equal(typeof result.eventId, 'number');
        });
  
        it('result contains main operation type', () => {
          assert.equal(result.operation, 'create');
        });
  
        it('event slug is same as provided', async () => {
          assert.equal(
            events['petites-boites-a-musique'].slug,
            await f.client('event')
              .first('slug')
              .where('uid', events['petites-boites-a-musique'].uid)
              .then(r => r.slug)
          );
        });
      });
    });
  
    describe('remove', () => {
      let result;
  
      before(async () => {
        await f.load();
      });
  
      before(async () => {
        result = await legacyRemove(f.client, events['ventes-de-velos-d-occasion-a-lambersart']);
      });
  
      it('result shows remove operation', () => {
        assert.equal(result.operation, 'remove');
      });
  
      it('insert was added to deleted table', async () => {
        const deletedEvent = await f.client.first('store')
          .from('deleted')
          .where('uid', 19853966)
          .then(r => JSON.parse(r.store));
  
        assert.equal(deletedEvent.slug, 'ventes-de-velos-d-occasion-a-lambersart');
      });
    });
  
    describe('update', () => {
      let result;
  
      before(async () => {
        await f.load();
      });
      
      before(async () => {
        result = await legacySet(f.client, events['ventes-de-velos-d-occasion-a-lambersart']);
      });
  
      it('result shows update operation', () => {
        assert.equal(result.operation, 'update');
      });
  
      it('eventLocation reference was updated', async () => {
        assert.equal(
          await f.client.first('location_id')
            .from('event_location')
            .where('event_id', 1)
            .then(r => r.location_id),
          4
        );
      });
  
      it('1 eventLocationTranslation entry was added', async () => {
        const entries = await f.client.select('elt.*')
          .from('event_location_translation as elt')
          .leftJoin('event_location as el', 'elt.id', 'el.id')
          .where('el.event_id', 1);
        
        assert.equal(entries.length, 1);
        assert.equal(entries[0].pricing_info, 'Pas cher');
      });
    });
  
    describe('baseTransform', () => {
      it('title is placed in event_translation entry, one entry per language', () => {
        const et = baseTransform({
          title: {
            fr: 'Un événement'
          }
        }).event_translation;
    
        assert.equal(et[0].title, 'Un événement');
        assert.equal(et[0].lang, 'fr');
      });
    
      it('uid is placed in event entry', () => {
        const entry = baseTransform({
          uid: 123
        });
    
        assert.equal(entry.event.uid, 123);
      });
    
      it('legacy goes to a jsonified array', () => {
        const entry = baseTransform({
          accessibility: ({
            hi: true,
            ii: false
          })
        }).event;
    
        assert.equal(entry.accessibility, '["hi"]')
      });
  
      it('image filename is placed in image column', () => {
        const entry = baseTransform({
          image: {
            filename: 'db7ab4eeac3249a5a57b5d315d608217.base.image.jpg',
            size: { width: 700, height: 565 },
            variants: [
              {
                filename: 'db7ab4eeac3249a5a57b5d315d608217.full.image.jpg',
                type: 'full'
              },
              {
                filename: 'db7ab4eeac3249a5a57b5d315d608217.thumb.image.jpg',
                type: 'thumbnail'
              }
            ]
          }
        }).event;
  
        assert.equal(entry.image, 'db7ab4eeac3249a5a57b5d315d608217.base.image.jpg');
      });
    
      it('image credits is placed in event entry', () => {
        const entry = baseTransform({
          imageCredits: 'C ma foto'
        }).event;
    
        assert.equal(entry.image_credits, 'C ma foto');
      });
    
      it('age goes in age_min and age_max', () => {
        const entry = baseTransform({
          age: { min: 20, max: 80 }
        }).event;
    
        assert.equal(entry.age_min, 20);
        assert.equal(entry.age_max, 80);
      });
    
      it('location id is specified in event_location entry', () => {
        const entry = baseTransform({
        }, { locationId: 1 });
    
        assert.equal(entry.event_location.location_id, 1);
      });
    
      it('ticket_link is a concatenation of registration field', () => {
        const entry = baseTransform({
          registration: ['https://openagenda.com', 'https://agenda.grand-albigeois.fr']
        });
    
        assert.equal(entry.event_location.ticket_link, 'https://openagenda.com, https://agenda.grand-albigeois.fr');
      });
    
      it('occurrences derive from timings', () => {
        const entry = baseTransform({
          timings: [{
            begin: '2020-12-18T17:00:00.000Z',
            end: '2020-12-18T19:00:00.000Z'
          }],
          locationUid: 222,
          timezone: 'Europe/Paris'
        }, { locationId: 2 });
    
        assert.deepEqual(_.omit(entry.occurrence[0], ['created_at', 'updated_at']), {
          date: '2020-12-18',
          time_start: '18:00',
          time_end: '20:00',
          location_id: 2
        });
      });
    
      it('event_location_translation.pricing_info derives from conditions', () => {
        const entry = baseTransform({
          conditions: {
            fr: 'Gratuit',
            en: 'Free'
          }
        });
    
        assert.deepEqual(
          entry.event_location_translation.map(elt => _.omit(elt, ['updated_at'])),
          [{
            lang: 'fr',
            pricing_info: 'Gratuit'
          }, {
            lang: 'en',
            pricing_info: 'Free'
          }]
        );
      });
    });
  
  });

});
