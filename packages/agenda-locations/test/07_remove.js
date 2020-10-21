'use strict';

const _ = require('lodash');
const assert = require('assert');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');

describe('agenda-locations - functional - update', function() {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      interfaces: {
        getAgendaIdByUid: async uid => ({
          7196947: 25221
        })[uid]
      }
    });
  });

  let removed;

  before(async () => {
    removed = await svc(7196947).remove(95301591);
  });

  it('remove provides removed location in response', () => {
    assert.equal(removed.uid, 95301591);
  });

  it('removed location is no longer present in db', async () => {
    const entry = await f.client('location').first().where('uid', removed.uid);

    assert.ok(entry === undefined);
  });

});
