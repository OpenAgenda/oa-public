'use strict';

const _ = require('lodash');
const assert = require('assert');
const fs = require('fs');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');

const payload = require('./fixtures/updateData.json');

describe('agenda-locations - functional - patch & update', function() {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaIdByUid: async uid => ({
          7196947: 25221
        })[uid],
        geocode: async address => [{ latitude: 10, longitude: 11 }]
      },
      Files: Files(dConfig.files)
    });
  });

  describe('default update', () => {
    let updated;

    before(async () => {
      updated = await svc(7196947).update(95301591, payload);
    });

    it('basic update provides updated location as a response', async () => {
      assert.equal(updated.name, payload.name);
    });
  });

  describe('default patch', () => {
    let patched;
    const entry = {};

    before(async () => {
      entry.before = await f.client('location').first().where('uid', 89634707);

      patched = await svc(7196947).patch(89634707, {
        name: 'Patched name'
      });
      entry.after = await f.client('location').first().where('uid', 89634707);
    });

    it('basic patch only affects provided fields', () => {
      assert.equal(entry.after.placename, 'Patched name');
      assert.equal(entry.after.address, 'Rue du château, 07570 Désaignes');
    });

    it('updatedAt is updated', async () => {
      assert.notEqual(JSON.stringify(entry.before.updated_at), JSON.stringify(entry.after.updated_at));
    });
  });

  describe('patching image', function () {
    let entry;

    before(async () => {
      await svc().patch(94482437, {
        image: fs.createReadStream(__dirname + '/fixtures/images/vieilles_pierres.jpg')
      });

      entry = await f.client('location').first().where('uid', 94482437);
    });

    it('saves uploaded image name in db', () => {
      assert.equal(JSON.parse(entry.store).image.split('?').shift(), `location94482437.jpg`);
    });
  });

  describe('set', () => {

    it('updates', async () => {
      const result = await svc.sets(1903810).locations.update(30433085, payload);
      assert.equal(
        await f.client('location').first().where('uid', 30433085).then(r => r.placename),
        payload.name
      );
    });

    it('patches', async () => {
      await svc.sets(1903810).locations.patch(30433085, {
        name: 'Patched'
      });
      assert.equal(
        await f.client('location').first().where('uid', 30433085).then(r => r.placename),
        'Patched'
      );
    });

    it('update through agendas endpoint does not clear set uid of location', async () => {
      const result = await svc(7196947).update(30433085, payload);
      assert.equal(
        await f.client('location').first().where('uid', 30433085).then(r => r.set_uid),
        1903810
      );
    })

  });

  describe('other', () => {

    it('uid cannot be modified through update', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1
      });

      assert.equal(updated.uid, 95301591);
    });

    it('uid cannot be modified through patch', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1
      });

      assert.equal(updated.uid, 95301591);
    });

    it('if latitude is not provided at update and geocodeIfUndefined option is set, a geocoding is made to derive them from address', async () => {
      const updated = await svc(7196947).update(95301591, _.omit(payload, ['latitude', 'longitude']), {
        geocodeIfUndefined: true
      });

      assert.equal(updated.latitude, 10);
      assert.equal(updated.longitude, 11);
    });

  });
});
