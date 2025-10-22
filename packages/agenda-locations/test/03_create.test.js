'use strict';

const fs = require('node:fs');
const _ = require('lodash');
const redis = require('redis');

const Files = require('@openagenda/files');
const Service = require('..');
const { service: config, dependencies: dConfig } = require('./testconfig');

const fixtures = require('./fixtures');

const payload = require('./fixtures/createData.json');
const initSettings = require('./fixtures/agendaTestSettings');

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

const initSettingsCantCreate = {
  ...initSettings,
  access: {
    create: { ...defaultAccess, authorized: false },
    delete: { ...defaultAccess, authorized: false },
    merge: defaultAccess,
    update: defaultAccess,
  },
};

describe('agenda-locations - functional - create', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    const redisClient = await redis.createClient({
      host: 'localhost',
      port: 6379,
    });

    await redisClient.connect();

    svc = Service({
      knex: f.client,
      redis: redisClient,
      interfaces: {
        getAgendaDetailsByUid: async (uid, fields = []) =>
          _.pick(
            {
              id: {
                7196947: 25221,
              }[uid],
              locationSetUid: {
                7196947: 1903810,
              }[uid],
            },
            fields,
          ),
        geocode: async (_address) => [
          {
            latitude: 47.6576571,
            longitude: -2.7834928,
            adminLevel2: 'Morbihan',
            adminLevel1: 'La région',
            adminLevel4: 'Vannes',
          },
        ],
        reverseGeocode: async (_latitude, _longitude) => [
          {
            address: 'an address',
            adminLevel1: 'La région2',
            adminLevel2: 'Morbihan2',
            adminLevel4: 'Vannes2',
            countryCode: 'FR',
          },
        ],
        getAgendaLocationSettings: async (_uid) => initSettingsDA,
      },
      Files: Files(dConfig.files),
    });
  });

  describe('defaults', () => {
    let created;

    beforeAll(async () => {
      created = await svc(7196947).create(payload);
    });

    it('basic create provides created location as a response', async () => {
      expect(created.name).toEqual(payload.name);
    });

    it('uid is added during create', () => {
      expect(typeof created.uid).toEqual('number');
    });

    it('slug is added during create', () => {
      expect(typeof created.slug).toEqual('string');
    });

    it('by default state value is 0', () => {
      expect(created.state).toEqual(0);
    });

    it('new entry is in db', async () => {
      const entry = await f
        .client('location')
        .first('placename')
        .where('uid', created.uid);

      expect(entry.placename).toEqual(created.name);
    });

    it('result does not provide agendaId', () => {
      expect(created.agendaId).toBeUndefined();
    });

    it('if region is not specified but adminLevel1 is', async () => {
      const newPayload = { ...payload, adminLevel1: payload.region };
      delete newPayload.region;
      const createdItem = await svc(7196947).create(newPayload);
      const entry = await f
        .client('location')
        .first()
        .where('uid', createdItem.uid);
      expect(entry.region).toEqual(newPayload.adminLevel1);
    });

    it('if department is not specified but adminLevel2 is', async () => {
      const newPayload = { ...payload, adminLevel2: payload.department };
      delete newPayload.department;
      const createdItem = await svc(7196947).create(newPayload);
      const entry = await f
        .client('location')
        .first()
        .where('uid', createdItem.uid);

      expect(entry.department).toEqual(newPayload.adminLevel2);
    });

    it('extIds are set', async () => {
      expect(created.extIds).toEqual([{ key: 'default', value: '123456' }]);
      const entry = await f
        .client('location')
        .first('ext_ids')
        .where('uid', created.uid);
      expect(entry.ext_ids).toBe('{"identifiers": ["default->123456"]}');
    });
  });

  describe('set', () => {
    let created;

    beforeAll(async () => {
      created = await svc.sets(1903810).locations.create(
        {
          name: 'Bruchon',
          address: 'Bruchon, Lamastre',
          countryCode: 'FR',
        },
        { autocomplete: true },
      );
    });

    it('created location is associated to set', () => {
      expect(created.setUid).toBe(1903810);
    });

    it('entry has set uid', async () => {
      const entrySetUid = await f
        .client('location')
        .first('set_uid')
        .where('uid', created.uid)
        .then((r) => r.set_uid);
      expect(entrySetUid).toBe(1903810);
    });

    it('location cannot be created if specified set does not exist', async () => {
      let error;
      try {
        await svc.sets(90389033829).locations.create(
          {
            name: 'Bruchon',
            address: 'Bruchon, Lamastre',
            countryCode: 'FR',
          },
          { autocomplete: true },
        );
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe('set not found');
    });

    it('location created on agendas endpoints and on an agenda associated with set is also associated to set', async () => {
      expect((await svc(7196947).create(payload)).setUid).toBe(1903810);
    });
  });

  describe('with image', () => {
    it('image filename is referenced in db entry', async () => {
      let created;
      try {
        created = await svc(7196947).create({
          ...payload,
          image: fs.createReadStream(
            `${__dirname}/fixtures/images/vieilles_pierres.jpg`,
          ),
        });
      } catch (e) {
        // console.log(e);
      }

      const entry = await f
        .client('location')
        .first('store')
        .where('uid', created.uid);

      expect(JSON.parse(entry.store).image).toMatch(
        new RegExp(`location${created.uid}\\.[a-f0-9]{32}\\.jpg`),
      );
    });

    it('fix: image full path is not inserted in db', async () => {
      let created;
      try {
        created = await svc(7196947).create(
          {
            ...payload,
            image: fs.createReadStream(
              `${__dirname}/fixtures/images/vieilles_pierres.jpg`,
            ),
          },
          {
            includeImagePath: true,
          },
        );
      } catch (e) {
        // console.log(e);
      }

      const entry = await f
        .client('location')
        .first('store')
        .where('uid', created.uid);

      expect(JSON.parse(entry.store).image).toMatch(
        new RegExp(`location${created.uid}\\.[a-f0-9]{32}\\.jpg`),
      );
    });
  });

  describe('autocomplete whitout coordinates', () => {
    let location;

    beforeAll(async () => {
      location = await svc(7196947).create(
        {
          name: 'Le Colisée',
          address: '31 rue de l’Epeule Parvis du Colisée, Roubaix',
          countryCode: 'FR',
        },
        {
          autocomplete: true,
        },
      );
    });

    it('latitude and longitude are defined in created location', () => {
      expect(location.latitude).toBe(47.6576571);
      expect(location.longitude).toBe(-2.7834928);
    });

    it('insee code is defined if provided by interface', () => {
      expect(location.insee).toBe('56260');
    });
  });

  describe('autocomplete with coordinates', () => {
    let location;

    beforeAll(async () => {
      location = await svc(7196947).create(
        {
          name: 'Le Colisée',
          address: '33 rue de l’Epeule Parvis du Colisée, Roubaix',
          countryCode: 'FR',
          latitude: 48.6576571,
          longitude: -2.7834928,
        },
        {
          autocomplete: true,
        },
      );
    });

    it('adminlevels are completed', () => {
      expect(location.adminLevel1).toBe('La région2');
    });

    it('latitude and longitude are unchanged', () => {
      expect(location.latitude).toBe(48.6576571);
      expect(location.longitude).toBe(-2.7834928);
    });
  });

  describe('fixes', () => {
    it('long name does not trigger an exception due to slug overflow', async () => {
      const l = await svc(7196947).create({
        name: 'Voie gallo-romaine dite voie de Jules César ou chemin de Chartres (également sur communes de Séme...',
        address: '41160 Membrolles',
        latitude: '47.996436',
        longitude: '1.48131',
        city: 'Membrolles',
        department: 'Loir-et-Cher',
        region: 'Centre-Val de Loire',
        postalCode: '41160',
        insee: '41173',
        countryCode: 'FR',
      });
      expect(l).toBeDefined();
    });

    it('if name is an integer, it should be converted to string at slug conversion', async () => {
      const { name } = await svc(7196947).create({
        name: 1083,
        address: '114 Rue de Turenne, 75003 Paris',
        latitude: 48.8632801,
        longitude: 2.3622204,
        countryCode: 'FR',
      });

      expect(name).toBe('1083');
    });

    it('error on too long extIds value', async () => {
      let error;
      try {
        await svc(7196947).create({
          name: 'test',
          address: '114 Rue de Turenne, 75003 Paris',
          latitude: 48.8632801,
          longitude: 2.3622204,
          countryCode: 'FR',
          extIds: [
            {
              key: 'default',
              value:
                '11111112222222222222222222222222222222222222222222222333333333333333333333333333333333333333DGHGJHSGFKJUSDGFIUYGSJUDFGBLJDSGBFJHSGFJKDSVGFKJHVBJkhSF',
            },
          ],
        });
      } catch (e) {
        error = e;
      }

      expect(error.info.errors[0].code).toBe('string.toolong');
      expect(error.info.errors[0].field).toBe('value');
    });

    describe('emoji handling', () => {
      it('emoji as name should trigger validation error', async () => {
        let error;
        try {
          await svc(7196947).create({
            name: '🎭',
            address: '114 Rue de Turenne, 75003 Paris',
            latitude: 48.8632801,
            longitude: 2.3622204,
            countryCode: 'FR',
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeDefined();
        expect(error.info.errors[0].field).toBe('name');
        expect(error.info.errors[0].code).toBe('string.invalid');
        expect(error.info.errors[0].message).toBe('emojis are not accepted');
      });

      it('emoji in address should trigger validation error', async () => {
        let error;
        try {
          await svc(7196947).create({
            name: 'Test Location',
            address: '123 Main St 🏠, Paris',
            latitude: 48.8632801,
            longitude: 2.3622204,
            countryCode: 'FR',
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeDefined();
        expect(error.info.errors[0].field).toBe('address');
        expect(error.info.errors[0].code).toBe('string.invalid');
        expect(error.info.errors[0].message).toBe('emojis are not accepted');
      });

      it('emoji in city should trigger validation error', async () => {
        let error;
        try {
          await svc(7196947).create({
            name: 'Test Location',
            address: '114 Rue de Turenne',
            city: 'Paris 🗼',
            latitude: 48.8632801,
            longitude: 2.3622204,
            countryCode: 'FR',
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeDefined();
        expect(error.info.errors[0].field).toBe('city');
        expect(error.info.errors[0].code).toBe('string.invalid');
        expect(error.info.errors[0].message).toBe('emojis are not accepted');
      });

      it('emoji in imageCredits should trigger validation error', async () => {
        let error;
        try {
          await svc(7196947).create({
            name: 'Test Location',
            address: '114 Rue de Turenne, 75003 Paris',
            latitude: 48.8632801,
            longitude: 2.3622204,
            countryCode: 'FR',
            image: fs.createReadStream(
              `${__dirname}/fixtures/images/vieilles_pierres.jpg`,
            ),
            imageCredits: 'Photo by 📷 John',
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeDefined();
        expect(error.info.errors[0].field).toBe('imageCredits');
        expect(error.info.errors[0].code).toBe('string.invalid');
        expect(error.info.errors[0].message).toBe('emojis are not accepted');
      });

      it('emoji in access field should trigger validation error', async () => {
        let error;
        try {
          await svc(7196947).create({
            name: 'Test Location',
            address: '114 Rue de Turenne, 75003 Paris',
            latitude: 48.8632801,
            longitude: 2.3622204,
            countryCode: 'FR',
            access: {
              fr: 'Accès handicapé ♿',
              en: 'Wheelchair access',
            },
          });
        } catch (e) {
          error = e;
        }

        expect(error).toBeDefined();
        expect(error.info.errors[0].field).toBe('access');
        expect(error.info.errors[0].code).toBe('string.invalid');
        expect(error.info.errors[0].message).toBe('emojis are not accepted');
      });

      it('emoji in description field is allowed', async () => {
        const location = await svc(7196947).create({
          name: 'Test Location',
          address: '114 Rue de Turenne, 75003 Paris',
          latitude: 48.8632801,
          longitude: 2.3622204,
          countryCode: 'FR',
          description: {
            fr: 'Un lieu magnifique 🎭✨',
            en: 'A beautiful place',
          },
        });

        expect(location.description.fr).toBe('Un lieu magnifique 🎭✨');
      });
    });
  });
});

describe('agenda-locations - functional - create - no rights', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      redis: redis.createClient(),
      interfaces: {
        getAgendaDetailsByUid: async (uid, fields = []) =>
          _.pick(
            {
              id: {
                7196947: 25221,
              }[uid],
              locationSetUid: {
                7196947: 1903811,
              }[uid],
            },
            fields,
          ),
        geocode: async (_address) => [
          {
            latitude: 47.6576571,
            longitude: -2.7834928,
            department: 'Morbihan',
            region: 'La région',
            city: 'Vannes',
          },
        ],
        getAgendaLocationSettings: async (_uid) => initSettingsCantCreate,
      },
      Files: Files(dConfig.files),
    });
  });

  describe('test allow byAgendaUid', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc(7196947).create(payload);
      } catch (error) {
        thrownError = error;
      }
    });
    it('allow should throw Error', () => {
      expect(thrownError.name).toBe('Forbidden');
    });
  });

  describe('test allow bySetUid', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc.sets(1903811).locations.create(
          {
            name: 'Bruchon',
            address: 'Bruchon, Lamastre',
            countryCode: 'FR',
          },
          { autocomplete: true },
        );
      } catch (error) {
        thrownError = error;
      }
    });

    it('allow should throw Error', () => {
      expect(thrownError.name).toBe('Forbidden');
    });
  });
});
