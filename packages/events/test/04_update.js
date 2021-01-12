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
const Service = require('../');

const data = {
  title: { fr: 'Spectacle de contes sur le thème de l\'Afrique' },
  description: { fr: 'Une description courte' },
  timezone: 'Europe/Paris',
  eventAttendanceMode: 1,
  locationUid: 47715652,
  timings: [{
    begin: '2020-12-09T10:00:00.000Z',
    end: '2020-12-09T12:00:00.000Z',
  }]
};

describe('events - functional - update', function() {
  this.timeout(10000);

  const f = fixtures(config.mysql, config.schema);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client
    });
  });

  describe('simple update', () => {
    let updated;

    before(async () => {
      updated = await svc.update(41414062, data);
    });

    it('result is updated event', () => {
      assert.equal(updated.title.fr, 'Spectacle de contes sur le thème de l\'Afrique');
    });

    it('entry is updated in table', async () => {
      const title = await f.client('event_2')
        .first(['title'])
        .where('uid', updated.uid)
        .then(r => r.title);

      assert.equal(title, '{"fr":"Spectacle de contes sur le thème de l\'Afrique"}');
    });
  });

  describe('simple patch', () => {
    let event;
    let patched;

    before(async () => {
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
    
    before(() => {
      svc = Service({
        knex: f.client,
        Files: Files(dConfig.files)
      });
    });

    it('image is uploaded', async () => {
      const updated = await svc.update(93469090, {
        ...data,
        image: fs.createReadStream(__dirname + '/fixtures/images/dog.png')
      });

      await axios.head('https:' + config.imagePath + updated.image.filename);
    });    
  });

  describe('interfaces', () => {
    const calls = [];

    before(async () => {
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

  });

});
