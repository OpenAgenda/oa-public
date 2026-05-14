import fs from 'node:fs';
import _ from 'lodash';

import Files from '@openagenda/files';

import Service from '../index.js';
import testconfig from './testconfig.js';

import setup from './fixtures/setup.js';

import payload from './fixtures/updateData.json' with { type: 'json' };

import initSettings from './fixtures/agendaTestSettings.js';

const { service: config, dependencies: dConfig } = testconfig;

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null,
};

const initSettingsDA = {
  ...initSettings,
  access: {
    create: defaultAccess,
    delete: defaultAccess,
    merge: defaultAccess,
    update: defaultAccess,
  },
};

const initSettingsCantUpdate = {
  ...initSettings,
  access: {
    create: { ...defaultAccess, authorized: false },
    delete: { ...defaultAccess, authorized: false },
    merge: defaultAccess,
    update: { ...defaultAccess, authorized: false },
  },
};

describe('agenda-locations - functional - patch & update', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${import.meta.dirname}/fixtures/ardeche/rows.sql`],
    });

    svc = Service({
      knex,
      interfaces: {
        getAgendaDetailsByUid: async (uid) => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        geocode: async (_address) => [{ latitude: 10, longitude: 11 }],
        getAgendaLocationSettings: async (_uid) => initSettingsDA,
      },
      Files: Files(dConfig.files),
    });
  });

  afterAll(() => knex?.destroy());

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
      entry.before = await knex('location').first().where('uid', 89634707);

      await svc(7196947).patch(89634707, {
        name: 'Patched name',
      });
      entry.after = await knex('location').first().where('uid', 89634707);
    });

    it('basic patch only affects provided fields', () => {
      expect(entry.after.placename).toEqual('Patched name');
      expect(entry.after.address).toEqual('Rue du château, 07570 Désaignes');
    });

    it('updatedAt is updated', async () => {
      expect(JSON.stringify(entry.before.updated_at)).not.toEqual(
        JSON.stringify(entry.after.updated_at),
      );
    });
  });

  describe('patching image', () => {
    let entry;

    beforeAll(async () => {
      await svc(7196947).patch(94482437, {
        image: fs.createReadStream(
          `${import.meta.dirname}/fixtures/images/vieilles_pierres.jpg`,
        ),
      });

      entry = await knex('location').first().where('uid', 94482437);
    });

    it('saves uploaded image name in db', () => {
      expect(JSON.parse(entry.store).image.split('?').shift()).toMatch(
        /location\d+\.[a-f0-9]{32}\.jpg/,
      );
    });

    it('patching image in store does not affect other store fields', () => {
      expect(JSON.parse(entry.store).state).toEqual(1);
    });
  });

  describe('patching duplicates', () => {
    let entry;

    beforeAll(async () => {
      await svc(7196947).patch(51665987, {
        duplicateCandidates: [30],
      });

      entry = await knex('location').first().where('uid', 51665987);
    });

    it('saves uploaded candidates in db', () => {
      expect(JSON.parse(entry.duplicate_candidates)).toStrictEqual([30]);
    });

    it('patching candidates in duplicates does not affect other duplicates fields', () => {
      expect(JSON.parse(entry.duplicate_disqualified)).toStrictEqual([5]);
    });
  });

  describe('set', () => {
    it('updates', async () => {
      await svc.sets(1903810).locations.update(30433085, payload);
      expect(
        await knex('location')
          .first()
          .where('uid', 30433085)
          .then((r) => r.placename),
      ).toEqual(payload.name);
    });

    it('patches', async () => {
      await svc.sets(1903810).locations.patch(30433085, {
        name: 'Patched',
      });
      expect(
        await knex('location')
          .first()
          .where('uid', 30433085)
          .then((r) => r.placename),
      ).toEqual('Patched');
    });

    it('update through agendas endpoint does not clear set uid of location', async () => {
      await svc(7196947).update(30433085, payload);
      expect(
        await knex('location')
          .first()
          .where('uid', 30433085)
          .then((r) => r.set_uid),
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
        image: '//cdn.openagenda.com/dev/location60763721.jpg',
        address: '07460 Saint-Paul-le-Jeune',
        imageCredits: 'New credits',
        longitude: 4.153617,
        latitude: 44.339599,
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

    it('extIds are set by patch and protected', async () => {
      const entry = {};
      entry.before = await knex('location').first().where('uid', 7630653);
      const updated = await svc(25221).patch(7630653, {
        extIds: [
          { key: 'default', value: 'ard_leg_1200' },
          { key: 'test', value: 'ard_leg_1201' },
        ],
      });
      entry.after = await knex('location').first().where('uid', 7630653);
      expect(entry.after.ext_ids).toEqual(
        '{"identifiers": ["default->ard_leg_1200", "test->ard_leg_1201"]}',
      );
      expect(updated.extIds).toEqual([
        { key: 'default', value: 'ard_leg_1200' },
        { key: 'test', value: 'ard_leg_1201' },
      ]);
    });

    it('extIds a set by update', async () => {
      const entry = {};
      entry.before = await knex('location').first().where('uid', 60763722);
      const updated = await svc(25221).update(
        60763722,
        {
          ...payload,
          extIds: [{ key: 'default', value: 'ard_leg_1200' }],
        },
        { mergeExtIds: false },
      );
      entry.after = await knex('location').first().where('uid', 60763722);

      expect(entry.after.ext_ids).toEqual(
        '{"identifiers": ["default->ard_leg_1200"]}',
      );
      expect(updated.extIds).toEqual([
        { key: 'default', value: 'ard_leg_1200' },
      ]);
    });

    it('extIds default can be set at null', async () => {
      const updated = await svc(25221).update(
        60763722,
        {
          ...payload,
          extIds: [{ key: 'default', value: null }],
        },
        { mergeExtIds: false },
      );
      expect(updated.extIds).toStrictEqual([{ key: 'default', value: null }]);
    });

    it('fix: patch should not break unspecified image', async () => {
      await svc(7196947).patch(
        86591143,
        {
          description: 'Une petite description',
        },
        { includeImagePath: true },
      );

      const image = await knex('location')
        .first()
        .where('uid', 86591143)
        .then((e) => JSON.parse(e.store).image);

      expect(image).toBe(null);
    });

    it('fix: adminLevels should be patchable', async () => {
      const prePatch = await svc(7196947).get(14471367, { detailed: true });

      expect(prePatch.adminLevel5).toBeNull();

      const patched = await svc(7196947).patch(14471367, {
        adminLevel5: 'Centre',
      });

      expect(patched.adminLevel5).toBe('Centre');

      const postPatch = await svc(7196947).get(14471367, { detailed: true });

      expect(postPatch.adminLevel5).toBe('Centre');
    });

    it('fix: patch without countryCode or address in payload and with autocomplete option should not attempt to patch latitude & longitude', async () => {
      let error;
      try {
        await svc(7196947).patch(
          86591143,
          {
            website: 'https://oa.com',
          },
          { autocomplete: true },
        );
      } catch (e) {
        error = e;
      }

      expect(error).toBeUndefined();
    });

    it('if a new adress is provided at update and autocomplete option is set, a geocoding is made to derive them from address', async () => {
      const updated = await svc(7196947).update(
        95301591,
        {
          ..._.omit(payload, ['latitude', 'longitude']),
          address: 'something new',
        },
        { autocomplete: true },
      );

      expect(updated.latitude).toEqual(10);
      expect(updated.longitude).toEqual(11);
    });
  });
});

describe('agenda-locations - functional - patch & update - no rights', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${import.meta.dirname}/fixtures/ardeche/rows.sql`],
    });

    svc = Service({
      knex,
      interfaces: {
        getAgendaDetailsByUid: async (uid) => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        geocode: async (_address) => [{ latitude: 10, longitude: 11 }],
        getAgendaLocationSettings: async (_uid) => initSettingsCantUpdate,
      },
      Files: Files(dConfig.files),
    });
  });

  afterAll(() => knex?.destroy());

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
          extIds: ['default->ard_leg_1200'],
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
