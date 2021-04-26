'use strict';

const assert = require('assert');
const _ = require('lodash');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
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

const initSettingsCantRemove = {...initSettings, access: {
  create: {...defaultAccess, authorized: false},
  delete: {...defaultAccess, authorized: false},
  merge: defaultAccess,
  update: defaultAccess
}}

describe('agenda-locations - functional - remove', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  let passedToInterface;

  before(async () => {
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
        getAgendaLocationSettings: async (uid) => initSettingsDA
      },
    });
  });

  describe('basic', () => {
    let removed;

    before(async () => {
      removed = await svc(7196947).remove(95301591);
    });

    it('remove provides removed location in response', () => {
      assert.equal(removed.uid, 95301591);
    });

    it('removed location is no longer present in db', async () => {
      const entry = await f
        .client('location')
        .first()
        .where('uid', removed.uid);

      assert.ok(entry === undefined);
    });

    it('removed location is passed to interface before it is removed', async () => {
      assert.equal(passedToInterface && passedToInterface.uid, 95301591);
    });
  });

  describe('set', () => {
    let removed;

    before(async () => {
      removed = await svc.sets(1903810).locations.remove(51665987);
    });

    it('remove provides removed location in response', () => {
      assert.equal(removed.uid, 51665987);
    });

    it('removed location is no longer present in db', async () => {
      const entry = await f
        .client('location')
        .first()
        .where('uid', removed.uid);

      assert.ok(entry === undefined);
    });
  });
});

describe('agenda-locations - functional - remove - no rights', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  let passedToInterface;

  before(async () => {
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
        getAgendaLocationSettings: async (uid) => initSettingsCantRemove
      },
    });
  });
  describe('test allow byAgendaUid', () => {
    let thrownError;

    before(async ()=>{
      try {
        await svc(7196947).remove(95301591);
      }
      catch(error){
        thrownError = error
      }
    })
    it('allow should throw Error', async () => {
      assert.equal(thrownError.name, 'UnauthorizedError');
    });
  });
  describe('test allow bySetUid', () => {
    let thrownError;

    before(async () => {
      try {
        await svc.sets(1903811).locations.remove(60763722);
      }
      catch(error){
        thrownError = error;
      }
    })
    it('allow should throw Error', async () => {
      assert.equal(thrownError.name, 'UnauthorizedError');
    });
  });
});