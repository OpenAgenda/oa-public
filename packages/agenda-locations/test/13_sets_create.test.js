'use strict';

const Files = require('@openagenda/files');
const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');

describe('agenda-locations - functional - sets create', () => {
  const f = fixtures(config.mysql);

  let svc;
  let created;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {},
      Files: Files(dConfig.files),
    });
  });

  beforeAll(async () => {
    created = await svc.sets.create({
      title: 'Un jeu de lieux',
    });
  });

  it('created set is given as the response', () => {
    expect(Object.keys(created)).toStrictEqual([
      'uid',
      'title',
      'createdAt',
      'updatedAt',
    ]);
  });

  it('entry is added', async () => {
    expect(await f.client('location_set').first().where('uid', created.uid)).toBeDefined();
  });

  it('title is in entry', async () => {
    expect(await f
      .client('location_set')
      .first()
      .where('uid', created.uid)
      .then(r => r.title)).toEqual('Un jeu de lieux');
  });
});
