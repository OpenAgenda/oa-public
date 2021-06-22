'use strict';

const assert = require('assert');

const Files = require('@openagenda/files');
const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');

describe('agenda-locations - functional - sets list', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
      },
      Files: Files(dConfig.files),
    });
  });

  it('basic list gets uids and titles', async () => {
    const sets = await svc.sets.list();
    assert.deepStrictEqual(sets, [
      {
        uid: 1903810,
        title: 'Les lieux du département Ardèchois'
      }, {
        uid: 1903811,
        title: 'Les autres lieux du département Ardèchois'
      }, {
        uid: 1903812,
        title: 'Les lieux du Bouchonnois' 
      }])
  });
});
