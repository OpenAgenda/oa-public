'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');
const Files = require('@openagenda/files');

describe('agenda-locations - functional - sets create', function() {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;
  let created;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {},
      Files: Files(dConfig.files)
    });
  });

  before(async () => {
    created = await svc.sets.create({
      title: 'Un jeu de lieux'
    });
  });

  it('created set is given as the response', () => {
    assert.deepEqual(Object.keys(created), ['uid', 'title', 'createdAt', 'updatedAt']);
  });

  it('entry is added', async () => {
    assert(await f.client('location_set').first().where('uid', created.uid));
  });

  it('title is in entry', async () => {
    assert.equal(
      await f.client('location_set').first().where('uid', created.uid).then(r => r.title),
      'Un jeu de lieux'
    );
  });
});
