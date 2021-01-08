'use strict';

const assert = require('assert');
const Files = require('@openagenda/files');


const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');
const fixtures = require('./fixtures');

const payload = require('./fixtures/mergeData.json');
const Service = require('..');

describe('agenda-locations - functional - merge', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;
  let location;
  let beforeCount;

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
        beforeMerge: async (mergeIn, merged) => {},
      },
    });
  });

  describe('basic', () => {
    before(async () => {
      beforeCount = await f
        .client('location')
        .count()
        .then(r => r[0]['count(*)']);
    });

    before(async () => {
      location = await svc(7196947).merge(
        95301591,
        { uids: [40305210, 52758960] },
        { name: 'fusionné' }
      );
    });

    it('result is merged location', () => {
      assert.equal(location.uid, 95301591);
    });

    it('count after merge is total - (merge count + 1)', async () => {
      const afterCount = await f
        .client('location')
        .count()
        .then(r => r[0]['count(*)']);

      assert.equal(afterCount, beforeCount - 2);
    });
  });

  describe('set', () => {
    before(async () => {
      beforeCount = await f
        .client('location')
        .count()
        .then(r => r[0]['count(*)']);
    });

    before(async () => {
      location = await svc.sets(1903810).locations.merge(
        51665985,
        {
          uids: [7630649, 60763721],
        },
        {
          name: 'fusionné',
        }
      );
    });

    it('result is merged location', () => {
      assert.equal(location.uid, 51665985);
    });

    it('count after merge is total - (merge count + 1)', async () => {
      const afterCount = await f
        .client('location')
        .count()
        .then(r => r[0]['count(*)']);

      assert.equal(afterCount, beforeCount - 2);
    });
  });
});
