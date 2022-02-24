'use strict';

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');

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

const initSettingsCantRemove = {
  ...initSettings,
  access: {
    create: { ...defaultAccess, authorized: false },
    delete: { ...defaultAccess, authorized: false },
    merge: defaultAccess,
    update: defaultAccess
  }
};

describe('agenda-locations - functional - remove', () => {
  const f = fixtures(config.mysql);

  let svc;

  let passedToInterface;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        beforeRemove: async l => {
          passedToInterface = l;
        },
        getAgendaLocationSettings: async _uid => initSettingsDA
      },
    });
  });

  describe('basic', () => {
    let removed;

    beforeAll(async () => {
      removed = await svc(7196947).remove(95301591);
    });

    it('remove provides removed location in response', () => {
      expect(removed.uid).toEqual(95301591);
    });

    it('removed location is still present in db with deleted = 1', async () => {
      const entry = await f
        .client('location')
        .first()
        .where('uid', removed.uid);

      expect(entry.deleted).toEqual(1);
    });

    it(
      'removed location is passed to interface before it is removed',
      async () => {
        expect(passedToInterface && passedToInterface.uid).toEqual(95301591);
      }
    );
  });

  describe('duplicates handling', () => {
    beforeAll(async () => {
      await svc(7196947).remove(51665987);
    });

    it('remove removed uid from duplicates candidates', async () => {
      await new Promise(r => setTimeout(r, 40));
      const test = await svc(7196947).get(51665986);
      expect(test.duplicateCandidates).toStrictEqual([]);
    });
  });

  describe('set', () => {
    let removed;

    beforeAll(async () => {
      removed = await svc.sets(1903810).locations.remove(60763721);
    });

    it('remove provides removed location in response', () => {
      expect(removed.uid).toEqual(60763721);
    });

    it('removed location is still present in db with deleted = 1', async () => {
      const entry = await f
        .client('location')
        .first()
        .where('uid', removed.uid);

      expect(entry.deleted).toEqual(1);
    });
  });
});

describe('agenda-locations - functional - remove - no rights', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        beforeRemove: async l => {
          const passedToInterface = l;
          return passedToInterface;
        },
        getAgendaLocationSettings: async _uid => initSettingsCantRemove
      },
    });
  });
  describe('test allow byAgendaUid', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc(7196947).remove(95301591);
      } catch (error) {
        thrownError = error;
      }
    });
    it('allow should throw Error', async () => {
      expect(thrownError.name).toEqual('Forbidden');
    });
  });
  describe('test allow bySetUid', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc.sets(1903811).locations.remove(60763722);
      } catch (error) {
        thrownError = error;
      }
    });
    it('allow should throw Error', async () => {
      expect(thrownError.name).toEqual('Forbidden');
    });
  });
});
