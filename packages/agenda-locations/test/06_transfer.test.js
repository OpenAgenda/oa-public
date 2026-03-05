'use strict';

const _ = require('lodash');
const Files = require('@openagenda/files');

const Service = require('..');
const { service: config, dependencies: dConfig } = require('./testconfig');

const fixtures = require('./fixtures');

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

const initSettingsCantUpdate = {
  ...initSettings,
  access: {
    create: { ...defaultAccess, authorized: false },
    delete: { ...defaultAccess, authorized: false },
    merge: defaultAccess,
    update: { ...defaultAccess, authorized: false },
  },
};

describe('agenda-locations - functional - transfer', () => {
  const f = fixtures(config.mysql);

  let svc;
  let onUpdateCalled = false;
  let onUpdateContext = null;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaDetailsByUid: async (uid) => ({
          id: {
            7196947: 25221,
            48353388: 30000,
            17026855: 35000,
          }[uid],
          locationSetUid: {
            7196947: 1903810,
            48353388: 2000000,
            17026855: 3000000,
          }[uid],
        }),
        getAgendaLocationSettings: async (_uid) => initSettingsDA,
        onUpdate: async (current, updated, context) => {
          onUpdateCalled = true;
          onUpdateContext = { current, updated, context };
        },
      },
      Files: Files(dConfig.files),
    });
  });

  describe('successful transfer', () => {
    let transferResult;
    let dbEntry;

    beforeAll(async () => {
      onUpdateCalled = false;
      onUpdateContext = null;

      transferResult = await svc(7196947).transfer(95301591, 48353388);

      dbEntry = await f.client('location').first().where('uid', 95301591);
    });

    it('returns transferred location', () => {
      expect(transferResult.uid).toBe(95301591);
      expect(transferResult.agendaId).toBe(30000);
      expect(transferResult.setUid).toBe(2000000);
    });

    it('updates agenda_id in database', () => {
      expect(dbEntry.agenda_id).toBe(30000);
    });

    it('updates set_uid in database', () => {
      expect(dbEntry.set_uid).toBe(2000000);
    });

    it('updates updated_at timestamp', () => {
      expect(dbEntry.updated_at).toBeDefined();
    });

    it('calls onUpdate interface', () => {
      expect(onUpdateCalled).toBe(true);
    });

    it('onUpdate receives correct parameters', () => {
      expect(onUpdateContext.current.uid).toBe(95301591);
      expect(onUpdateContext.updated.uid).toBe(95301591);
      expect(onUpdateContext.updated.agendaId).toBe(30000);
      expect(onUpdateContext.updated.setUid).toBe(2000000);
    });
  });

  describe('transfer with non-existent location', () => {
    let error;

    beforeAll(async () => {
      try {
        await svc(7196947).transfer(99999999, 48353388);
      } catch (e) {
        error = e;
      }
    });

    it('throws NotFound error', () => {
      expect(error.name).toBe('NotFound');
    });
  });

  describe('transfer to non-existent agenda', () => {
    let error;

    beforeAll(async () => {
      try {
        await svc(7196947).transfer(89634707, 99999999);
      } catch (e) {
        error = e;
      }
    });

    it('throws NotFound error', () => {
      expect(error.name).toBe('NotFound');
      expect(error.message).toContain('target agenda not found');
    });
  });

  describe('transfer preserves location data', () => {
    let beforeTransfer;
    let afterTransfer;

    beforeAll(async () => {
      beforeTransfer = await svc(7196947).get(94482437);

      afterTransfer = await svc(7196947).transfer(94482437, 17026855);
    });

    it('preserves name', () => {
      expect(afterTransfer.name).toBe(beforeTransfer.name);
    });

    it('preserves address', () => {
      expect(afterTransfer.address).toBe(beforeTransfer.address);
    });

    it('preserves coordinates', () => {
      expect(afterTransfer.latitude).toBe(beforeTransfer.latitude);
      expect(afterTransfer.longitude).toBe(beforeTransfer.longitude);
    });

    it('only changes agendaId and setUid', () => {
      const beforeKeys = _.omit(beforeTransfer, [
        'agendaId',
        'setUid',
        'updatedAt',
      ]);
      const afterKeys = _.omit(afterTransfer, [
        'agendaId',
        'setUid',
        'updatedAt',
      ]);
      expect(beforeKeys).toEqual(afterKeys);
    });
  });
});

describe('agenda-locations - functional - transfer - no rights', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaDetailsByUid: async (uid) => ({
          id: {
            7196947: 25221,
            48353388: 30000,
          }[uid],
          locationSetUid: {
            7196947: 1903810,
            48353388: 2000000,
          }[uid],
        }),
        getAgendaLocationSettings: async (_uid) => initSettingsCantUpdate,
      },
      Files: Files(dConfig.files),
    });
  });

  describe('unauthorized transfer', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc(7196947).transfer(95301591, 48353388);
      } catch (error) {
        thrownError = error;
      }
    });

    it('throws Forbidden error', () => {
      expect(thrownError.name).toEqual('Forbidden');
    });
  });
});
