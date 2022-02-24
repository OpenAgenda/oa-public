'use strict';

const fs = require('fs');
const _ = require('lodash');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');

const payload = require('./fixtures/updateData.json');

const initSettings = require('./fixtures/agendaTestSettings');

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

const initSettingsDA = {
  ...initSettings,
  access: {
    create: defaultAccess,
    delete: defaultAccess,
    merge: defaultAccess,
    update: defaultAccess
  }
};

const initSettingsCantUpdate = {
  ...initSettings,
  access: {
    create: { ...defaultAccess, authorized: false },
    delete: { ...defaultAccess, authorized: false },
    merge: defaultAccess,
    update: { ...defaultAccess, authorized: false }
  }
};

describe('agenda-locations - functional - patch & update', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        geocode: async _address => [{ latitude: 10, longitude: 11 }],
        getAgendaLocationSettings: async _uid => initSettingsDA
      },
      Files: Files(dConfig.files),
    });
  });

  describe('default update', () => {
    let updated;

    beforeAll(async () => {
      updated = await svc(7196947).update(95301591, payload);
    });

    it('basic update provides updated location as a response', async () => {
      expect(updated.name).toEqual(payload.name);
    });
  });

  describe('default patch', () => {
    const entry = {};

    beforeAll(async () => {
      entry.before = await f.client('location').first().where('uid', 89634707);

      await svc(7196947).patch(89634707, {
        name: 'Patched name',
      });
      entry.after = await f.client('location').first().where('uid', 89634707);
    });

    it('basic patch only affects provided fields', () => {
      expect(entry.after.placename).toEqual('Patched name');
      expect(entry.after.address).toEqual('Rue du château, 07570 Désaignes');
    });

    it('updatedAt is updated', async () => {
      expect(JSON.stringify(entry.before.updated_at)).not.toEqual(JSON.stringify(entry.after.updated_at));
    });
  });

  describe('patching image', () => {
    let entry;

    beforeAll(async () => {
      await svc(7196947).patch(94482437, {
        image: fs.createReadStream(
          `${__dirname}/fixtures/images/vieilles_pierres.jpg`
        ),
      });

      entry = await f.client('location').first().where('uid', 94482437);
    });

    it('saves uploaded image name in db', () => {
      expect(JSON.parse(entry.store).image.split('?').shift()).toEqual('location94482437.jpg');
    });

    it('patching image in store does not affect other store fields', () => {
      expect(JSON.parse(entry.store).extId).toEqual('22');
    });
  });

  describe('patching duplicates', () => {
    let entry;

    beforeAll(async () => {
      await svc(7196947).patch(51665987, {
        duplicateCandidates: [30]
      });

      entry = await f.client('location').first().where('uid', 51665987);
    });

    it('saves uploaded candidates in db', () => {
      expect(JSON.parse(entry.duplicates).candidates).toStrictEqual([30]);
    });

    it('patching candidates in duplicates does not affect other duplicates fields', () => {
      expect(JSON.parse(entry.duplicates).disqualified).toStrictEqual([5]);
    });
  });

  describe('set', () => {
    it('updates', async () => {
      await svc
        .sets(1903810)
        .locations.update(30433085, payload);
      expect(
        await f
          .client('location')
          .first()
          .where('uid', 30433085)
          .then(r => r.placename)
      ).toEqual(payload.name);
    });

    it('patches', async () => {
      await svc.sets(1903810).locations.patch(30433085, {
        name: 'Patched',
      });
      expect(
        await f
          .client('location')
          .first()
          .where('uid', 30433085)
          .then(r => r.placename)
      ).toEqual('Patched');
    });

    it('update through agendas endpoint does not clear set uid of location', async () => {
      await svc(7196947).update(30433085, payload);
      expect(
        await f
          .client('location')
          .first()
          .where('uid', 30433085)
          .then(r => r.set_uid)
      ).toEqual(1903810);
    });
  });

  describe('other', () => {
    it('uid cannot be modified through update', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1,
      });

      expect(updated.uid).toEqual(95301591);
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

      expect(updated.imageCredits).toEqual('New credits');
    });

    it('uid cannot be modified through patch', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1,
      });

      expect(updated.uid).toEqual(95301591);
    });

    it('if extId is not part of patch and is not set in main extId field, it is synced from legacy', async () => {
      await svc.sets(1903810).locations.patch(7630649, {});

      const entry = await f
        .client('location')
        .first('ext_id')
        .where('uid', 7630649);

      expect(entry.ext_id).toEqual('leg_ard_03');
    });

    it(
      'if extId is part of patch, it is synced to legacy and set in dedicated field',
      async () => {
        const updated = await svc.sets(1903810).locations.patch(60763721, {
          extId: 'ard_leg_1200',
        });

        const { store } = await f
          .client('location')
          .first(['store'])
          .where('uid', 60763721)
          .then(r => ({
            store: JSON.parse(r.store),
            extId: r.ext_id,
          }));

        expect(store.extId).toEqual('ard_leg_1200');
        expect(updated.extId).toEqual('ard_leg_1200');
      }
    );

    it(
      'fix: patch should not break unspecified image',
      async () => {
        await svc(7196947).patch(86591143, {
          description: 'Une petite description'
        }, { includeImagePath: true });

        const image = await f.client('location')
          .first()
          .where('uid', 86591143)
          .then(e => JSON.parse(e.store).image);

        expect(image).toBe(null);
      }
    );

    it(
      'if latitude is not provided at update and geocodeIfUndefined option is set, a geocoding is made to derive them from address',
      async () => {
        const updated = await svc(7196947).update(
          95301591,
          _.omit(payload, ['latitude', 'longitude']),
          { geocodeIfUndefined: true }
        );

        expect(updated.latitude).toEqual(10);
        expect(updated.longitude).toEqual(11);
      }
    );
  });
});

describe('agenda-locations - functional - patch & update - no rights', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        geocode: async _address => [{ latitude: 10, longitude: 11 }],
        getAgendaLocationSettings: async _uid => initSettingsCantUpdate
      },
      Files: Files(dConfig.files),
    });
  });

  describe('test allow byAgendaUid', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc(7196947).update(95301591, payload);
      } catch (error) {
        thrownError = error;
      }
    });

    it('allow should throw Error', () => {
      expect(thrownError.name).toEqual('Forbidden');
    });
  });

  describe('test allow bySetUid', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc.sets(1903811).locations.patch(60763722, {
          extId: 'ard_leg_1200',
        });
      } catch (error) {
        thrownError = error;
      }
    });

    it('allow should throw Error', () => {
      expect(thrownError.name).toEqual('Forbidden');
    });
  });
});
