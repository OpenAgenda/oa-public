'use strict';

const _ = require('lodash');
const assert = require('assert');
const axios = require('axios');
const fs = require('fs');
const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');

const data = {
  title: { fr: 'Spectacle de contes sur le thème de l\'Afrique' },
  description: { fr: 'Une description courte' },
  timezone: 'Europe/Paris',
  attendanceMode: 1,
  locationUid: 47715652,
  timings: [{
    begin: '2020-12-09T10:00:00.000Z',
    end: '2020-12-09T12:00:00.000Z',
  }],
  age: { min: undefined, max: undefined }
};

describe('events - functional - update', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client
    });
  });

  describe('simple update', () => {
    let updated;
    let entry;

    beforeAll(async () => {
      updated = await svc.update(41414062, data);
      entry = await f.client('event_2')
        .first()
        .where('uid', updated.uid);
    });

    it('result is updated event', () => {
      assert.equal(updated.title.fr, 'Spectacle de contes sur le thème de l\'Afrique');
    });

    it('entry is updated in table', async () => {
      assert.equal(entry.title, '{"fr":"Spectacle de contes sur le thème de l\'Afrique"}');
    });
  });

  describe('simple patch', () => {
    let event;
    let patched;

    beforeAll(async () => {
      event = await svc.get({ slug: 'exposition-legypte-ancienne' });
      patched = await svc.patch({ slug: 'exposition-legypte-ancienne' }, {
        title: {
          fr: 'Expo Egypte ancienne'
        }
      });
    });

    it('result shows patched event', () => {
      assert.equal(patched.title.fr, 'Expo Egypte ancienne');
    });

    it('fields other than updated remain unchanged', () => {
      assert.deepEqual(
        _.omit(patched, ['updatedAt', 'title']),
        _.omit(event, ['updatedAt', 'title']),
      );
    });
  });

  describe('update with image', () => {
    let svc;

    beforeAll(done => {
      fs.createReadStream(`${__dirname}/fixtures/images/dog.png`)
        .pipe(fs.createWriteStream('/tmp/dog.png'))
        .on('close', done)
    });

    beforeAll(() => {
      svc = Service({
        knex: f.client,
        Files: Files(dConfig.files)
      });
    });

    it('image is uploaded', async () => {
      const updated = await svc.update(93469090, {
        ...data,
        image: fs.createReadStream('/tmp/dog.png')
      });

      await axios.head('https:' + config.imagePath + updated.image.filename);
    });

    it('image credits are updated', async () => {
      const event = await svc.create(fixtures.creditsEventCreate);
      const updated = await svc.update(event.uid, fixtures.creditsEventUpdate);

      assert.equal(updated.imageCredits, 'Crédits à jour');
    });

    it('image credits are removed from image data when patch clears them from main field', async () => {
      const event = await svc.create(fixtures.creditsEventCreate);

      await svc.update(event.uid, {
        imageCredits: 'updated credits'
      }, {
        isPatch: true
      });

      await svc.update(event.uid, {
        imageCredits: ''
      }, {
        isPatch: true
      });

      assert.strictEqual(
        await f.client('event_2').first('image').where('uid', event.uid).then(r => JSON.parse(r.image).credits),
        null
      );
    });
  });

  describe('interfaces', () => {
    const calls = [];

    beforeAll(async () => {
      svc = Service({
        knex: f.client,
        interfaces: {
          beforeUpdate: async (before, after, context) => {
            calls.push(['beforeUpdate', before, after, context]);
          },
          onUpdate: async (before, after, context) => {
            calls.push(['onUpdate', before, after, context]);
          }
        }
      });

      await svc.update(93469090, data, { context: 'Update context'});
    });

    it('beforeUpdate was called', () => {
      assert.equal(calls[0][0], 'beforeUpdate');
    });

    it('onUpdate was called', () => {
      assert.equal(calls[1][0], 'onUpdate');
    });

    it('age in onUpdate is with values set to null', () => {
      assert.deepEqual(calls[1][2].age, {
        min: null,
        max: null
      });
    });
  });

  describe('other', () => {

    it('update of draft event', async () => {
      const draftEvent = await svc.create({
        title: 'Un titre'
      }, { draft: true });

      const updatedDraftEvent = await svc.update(draftEvent.uid, {
        title: 'Un titre modifié'
      }, { draft: true });

      assert.equal(updatedDraftEvent.title.en, 'Un titre modifié');
    });

    it('undrafting through patch', async () => {
      const draftEvent = await svc.create({
        title: 'Un autre titre'
      }, { draft: true });

      assert.equal(draftEvent.draft, true);

      const undraftedEvent = await svc.patch(draftEvent.uid, data, {
        draft: false
      });

      expect(undraftedEvent.draft).toBe(false);

      const entry = await f.client('event_2')
        .first('draft')
        .where('uid', draftEvent.uid);

      expect(entry.draft).toBe(0);
    });

    it('fix: patch from DHM format', async () => {
      await svc.patch({ slug: 'exposition-legypte-ancienne' }, {
        timings: [
          {
            begin: {
              date: '2020-11-22',
              hours: 13,
              minutes: 0
            },
            end: {
              date: '2020-11-22',
              hours: 13,
              minutes: 30
            }
          }
        ]
      });

      const entry = await f.client('event_2').first('timings').where('slug', 'exposition-legypte-ancienne');

      assert.equal(entry.timings, '[{"begin":"2020-11-22T13:00:00.000+01:00","end":"2020-11-22T13:30:00.000+01:00"}]');
    });

    it('links can be patched', async () => {
        const result = await svc.patch({ slug: 'exposition-legypte-ancienne' }, {
          links: [
            {
              "link": "https://fr.calameo.com/read/0000531373581dd606b95",
              "data": {
                "url": "https://www.calameo.com/read/0000531373581dd606b95",
                "type": "rich",
                "version": "1.0",
                "title": "Petites vacances scolaires 3/17 ans - Hiver / Printemps 2021",
                "author": "Ville de Roubaix",
                "author_url": "https://www.calameo.com/accounts/53137",
                "provider_name": "calameo.com",
                "description": "petites vacances scolaires ACCUEILS DE LOISIRS 3/17 ANS Dates d’ouverture des centres Vacances d’Hiver : du 22 février au 5 mars HIVER 2021 Vacances de Printemps : du 26 avril au 7 PRINTEMPS mai 2021 Dates limites d’inscription : 2021 13...",
                "thumbnail_url": "https://p.calameoassets.com/210114155242-fc5ad8a39a0af2fd840cadbfe988b11d/p1.jpg",
                "thumbnail_width": 1125,
                "thumbnail_height": 1596,
                "html": "<div style=\"left: 0; width: 100%; height: 0; position: relative; padding-bottom: 71.0024%;\"><iframe src=\"//v.calameo.com/?bkcode=0000531373581dd606b95\" style=\"border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;\" allowfullscreen scrolling=\"no\" allow=\"encrypted-media\"></iframe></div>",
                "cache_age": 86400
              },
              "type": "oembed"
            }
          ]
        });

        assert.equal(result.links.length, 1);
    });

    it('age provided as empty object is cleaned to { min: null, max: null }', async () => {
      const { age } = await svc.patch({ slug: 'exposition-legypte-ancienne' }, {
        age: {}
      });
      expect(age).toEqual({ min: null, max: null });
    });

  });

});
