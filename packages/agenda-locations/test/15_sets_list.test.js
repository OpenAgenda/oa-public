'use strict';

const Files = require('@openagenda/files');
const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');

describe('agenda-locations - functional - sets list', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
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
    expect(sets).toStrictEqual([
      {
        uid: 1903810,
        title: 'Les lieux du département Ardèchois'
      }, {
        uid: 1903811,
        title: 'Les autres lieux du département Ardèchois'
      }, {
        uid: 1903812,
        title: 'Les lieux du Bouchonnois'
      }
    ]);
  });
});
