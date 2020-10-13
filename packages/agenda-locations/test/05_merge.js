'use strict';

const assert = require('assert');
const fixtures = require('./fixtures');
const Service = require('../');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const payload = require('./fixtures/mergeData.json');

describe('agenda-locations - functional - merge', () => {
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
        getAgendaIdByUid: async uid => ({
          7196947: 25221
        })[uid],
        locationsWillMerge: async (mergeIn, merged) => {}
      }
    });
  });

  before(async () => {
    beforeCount = await f.client('location').count().then(r => r[0]['count(*)']);
  });

  before(async () => {
    location = await svc(7196947).merge({ uids: [40305210, 52758960, 95301591] }, { name: 'fusionné'})
  });

  it('result is merged location', () => {
    assert.equal(location.uid, 95301591);
  });

  it('count after merge is total - (merge count + 1)', async () => {
    const afterCount = await f.client('location').count().then(r => r[0]['count(*)']);

    assert.equal(afterCount, beforeCount - 2);
  });
});
