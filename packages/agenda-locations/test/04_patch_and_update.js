'use strict';

const assert = require('assert');
const fs = require('fs');
const _ = require('lodash');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fixtures = require('./fixtures');

const payload = require('./fixtures/updateData.json');
const Service = require('..');

const initSettings = require('./fixtures/agendaTestSettings');

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

const initSettingsDA = {...initSettings, access: {
  create: defaultAccess,
  delete: defaultAccess,
  merge: defaultAccess,
  update: defaultAccess
}}

const initSettingsCantUpdate = {...initSettings, access: {
  create: {...defaultAccess, authorized: false},
  delete: {...defaultAccess, authorized: false},
  merge: defaultAccess,
  update: {...defaultAccess, authorized: false}
}}

describe('agenda-locations - functional - patch & update', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        geocode: async address => [{ latitude: 10, longitude: 11 }],
        getAgendaLocationSettings: async uid => initSettingsDA
      },
      Files: Files(dConfig.files),
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
        name: 'Patched name',
      });
      entry.after = await f.client('location').first().where('uid', 89634707);
    });

    it('basic patch only affects provided fields', () => {
      assert.equal(entry.after.placename, 'Patched name');
      assert.equal(entry.after.address, 'Rue du château, 07570 Désaignes');
    });

    it('updatedAt is updated', async () => {
      assert.notEqual(
        JSON.stringify(entry.before.updated_at),
        JSON.stringify(entry.after.updated_at)
      );
    });
  });

  describe('patching image', function(){
    let entry;
    this.timeout(20000);

    before(async () => {
      await svc(7196947).patch(94482437, {
        image: fs.createReadStream(
          `${__dirname}/fixtures/images/vieilles_pierres.jpg`
        ),
      });

      entry = await f.client('location').first().where('uid', 94482437);
    });

    it('saves uploaded image name in db', () => {
      assert.equal(
        JSON.parse(entry.store).image.split('?').shift(),
        'location94482437.jpg'
      );
    });

    it('patching image in store does not affect other store fields', () => {
      assert.equal(JSON.parse(entry.store).extId, 22);
    });
  });

  describe('set', () => {
    it('updates', async () => {
      const result = await svc
        .sets(1903810)
        .locations.update(30433085, payload);
      assert.equal(
        await f
          .client('location')
          .first()
          .where('uid', 30433085)
          .then(r => r.placename),
        payload.name
      );
    });

    it('patches', async () => {
      await svc.sets(1903810).locations.patch(30433085, {
        name: 'Patched',
      });
      assert.equal(
        await f
          .client('location')
          .first()
          .where('uid', 30433085)
          .then(r => r.placename),
        'Patched'
      );
    });

    it('update through agendas endpoint does not clear set uid of location', async () => {
      const result = await svc(7196947).update(30433085, payload);
      assert.equal(
        await f
          .client('location')
          .first()
          .where('uid', 30433085)
          .then(r => r.set_uid),
        1903810
      );
    });
  });

  describe('other', () => {
    it('uid cannot be modified through update', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1,
      });

      assert.equal(updated.uid, 95301591);
    });

    it('imageCredits can be patched on location with image', async () => {
      const updated = await svc(7196947).update(60763721, {
        region: 'Auvergne-Rhône-Alpes',
        department: 'Ardèche',
        city: 'Saint-Paul-le-Jeune',
        timezone: 'Europe/Paris',
        postalCode: '07460',
        name: 'Saint-Paul-le-Jeune',
        countryCode: 'FR',
        image: '//cibuldev.s3.amazonaws.com/location60763721.jpg',
        address: '07460 Saint-Paul-le-Jeune',
        imageCredits: 'New credits',
        longitude: 4.153617,
        latitude: 44.339599
      });

      assert.equal(updated.imageCredits, 'New credits');
    });

    it('uid cannot be modified through patch', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1,
      });

      assert.equal(updated.uid, 95301591);
    });

    it('if extId is not part of patch, it is synced from legacy', async () => {
      await svc.sets(1903810).locations.patch(7630649, {});

      const entry = await f
        .client('location')
        .first('ext_id')
        .where('uid', 7630649);

      assert.equal(entry.ext_id, 'leg_ard_03');
    });

    it('if extId is part of patch, it is synced to legacy and set in dedicated field', async () => {
      const updated = await svc.sets(1903810).locations.patch(60763721, {
        extId: 'ard_leg_1200',
      });

      const { store, extId } = await f
        .client('location')
        .first(['store', 'ext_id'])
        .where('uid', 60763721)
        .then(r => ({
          store: JSON.parse(r.store),
          extId: r.ext_id,
        }));

      assert.equal(store.extId, 'ard_leg_1200');
      assert.equal(updated.extId, 'ard_leg_1200');
    });

    it('if latitude is not provided at update and geocodeIfUndefined option is set, a geocoding is made to derive them from address', async () => {
      const updated = await svc(7196947).update(
        95301591,
        _.omit(payload, ['latitude', 'longitude']),
        {
          geocodeIfUndefined: true,
        }
      );

      assert.equal(updated.latitude, 10);
      assert.equal(updated.longitude, 11);
    });
  });
});

describe('agenda-locations - functional - patch & update - no rights', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        geocode: async address => [{ latitude: 10, longitude: 11 }],
        getAgendaLocationSettings: async uid => initSettingsCantUpdate
      },
      Files: Files(dConfig.files),
    });
  });
  describe('test allow byAgendaUid', () => {
    let thrownError;

    before(async ()=>{
      try {
        await svc(7196947).update(95301591, payload);
      }
      catch(error){
        thrownError = error
      }
    })
    it('allow should throw Error', () => {
      assert.equal(thrownError.name, 'UnauthorizedError');;
    });
  });describe('test allow bySetUid', () => {
    let thrownError;

    before(async ()=>{
      try {
        await svc.sets(1903811).locations.patch(60763722, {
          extId: 'ard_leg_1200',
        });
      }
      catch(error){
        thrownError = error
      }
    })
    it('allow should throw Error', () => {
      assert.equal(thrownError.name, 'UnauthorizedError');
    });
  });
});
