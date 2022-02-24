'use strict';

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');
const Service = require('..');
const fixtures = require('./fixtures');

// const payload = require('./fixtures/mergeData.json');
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

const initSettingsCantMerge = {
  ...initSettings,
  access: {
    create: { ...defaultAccess, authorized: false },
    delete: { ...defaultAccess, authorized: false },
    merge: { ...defaultAccess, authorized: false },
    update: defaultAccess
  }
};

describe('agenda-locations - functional - merge', () => {
  const f = fixtures(config.mysql);

  let svc;
  let location;
  let beforeCount;

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
        beforeMerge: async (_mergeIn, _merged) => {},
        getAgendaLocationSettings: async _uid => initSettingsDA
      },
    });
  });

  describe('basic', () => {
    beforeAll(async () => {
      beforeCount = await f
        .client('location')
        .count()
        .where('deleted', 0)
        .then(r => r[0]['count(*)']);
    });

    beforeAll(async () => {
      location = await svc(7196947).merge(
        95301591,
        { uids: [40305210, 52758960] },
        { name: 'fusionné' }
      );
    });

    it('result is merged location', () => {
      expect(location.uid).toEqual(95301591);
    });

    it('count after merge is total - (merge count + 1)', async () => {
      const afterCount = await f
        .client('location')
        .count()
        .where('deleted', 0)
        .then(r => r[0]['count(*)']);

      expect(afterCount).toEqual(beforeCount - 2);
    });
  });

  describe('no data', () => {
    beforeAll(async () => {
      beforeCount = await f
        .client('location')
        .count()
        .where('deleted', 0)
        .then(r => r[0]['count(*)']);
    });

    beforeAll(async () => {
      location = await svc(7196947).merge(
        95301591,
        { uids: [13470871, 43404100] },
        null
      );
    });

    it('result is merged location', () => {
      expect(location.uid).toEqual(95301591);
    });

    it('count after merge is total - (merge count + 1)', async () => {
      const afterCount = await f
        .client('location')
        .count()
        .where('deleted', 0)
        .then(r => r[0]['count(*)']);

      expect(afterCount).toEqual(beforeCount - 2);
    });

    it('deleted location as merged_in field', async () => {
      const mergedInObj = await f
        .client('location')
        .first('merged_in')
        .where('uid', 13470871)
        .then(r => r);
      expect(mergedInObj.merged_in).toEqual(95301591);
    });
  });

  describe('set', () => {
    beforeAll(async () => {
      beforeCount = await f
        .client('location')
        .count()
        .where('deleted', 0)
        .then(r => r[0]['count(*)']);
    });

    beforeAll(async () => {
      location = await svc.sets(1903810).locations.merge(
        51665987,
        {
          uids: [7630649, 60763721],
        },
        {
          name: 'fusionné',
        }
      );
    });

    it('result is merged location', () => {
      expect(location.uid).toEqual(51665987);
    });

    it('count after merge is total - (merge count + 1)', async () => {
      const afterCount = await f
        .client('location')
        .count()
        .where('deleted', 0)
        .then(r => r[0]['count(*)']);

      expect(afterCount).toEqual(beforeCount - 2);
    });
  });
});

describe('agenda-locations - functional - merge - no rights', () => {
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
        beforeMerge: async (_mergeIn, _merged) => {},
        getAgendaLocationSettings: async _uid => initSettingsCantMerge
      },
    });
  });
  describe('test allow byAgendaUid', () => {
    let thrownError;

    beforeAll(async () => {
      try {
        await svc(7196947).merge(
          95301591,
          { uids: [40305210, 52758960] },
          { name: 'fusionné' }
        );
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
        await svc.sets(1903811).locations.merge(
          51665986,
          {
            uids: [7630650, 60763722],
          },
          {
            name: 'fusionné',
          }
        );
      } catch (error) {
        thrownError = error;
      }
    });

    it('allow should throw Error', () => {
      expect(thrownError.name).toEqual('Forbidden');
    });
  });
});

describe('agenda-locations - functional - merge - duplicates', () => {
  const f = fixtures(config.mysql, 'hauteSavoie.sql');

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 30907,
          }[uid],
        }),
        beforeMerge: async (_mergeIn, _merged) => {},
        getAgendaLocationSettings: async _uid => initSettings
      },
    });
  });
  describe('duplicates handling', () => {
    beforeAll(async () => {
      await svc(7196947).merge(
        52174054,
        { uids: [52174055, 52174056] },
        { name: 'fusionné' }
      );
    });

    it('clean duplicates candidata of merge Target', async () => {
      const target = await f.client('location').first()
        .where('uid', 52174054);
      expect(target.duplicates).toStrictEqual('{"candidates":[],"disqualified":[]}');
    });
  });
});
