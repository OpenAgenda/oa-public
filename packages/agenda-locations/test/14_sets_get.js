'use strict';

const assert = require('assert');

const Files = require('@openagenda/files');
const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');

describe('agenda-locations - functional - sets get', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getSetAgendasCount: async setUid => 14,
      },
      Files: Files(dConfig.files),
    });
  });

  it('basic get gets uid and title', async () => {
    const set = await svc.sets.get(1903810);

    assert.deepEqual(set, {
      uid: 1903810,
      title: 'Les lieux du département Ardèchois',
    });
  });

  it('detailed get gets total of linked agendas', async () => {
    const set = await svc.sets.get(1903810, { detailed: true });

    assert.deepEqual(set, {
      uid: 1903810,
      title: 'Les lieux du département Ardèchois',
      agendasCount: 14,
      locationsCount: 4,
    });
  });
});
