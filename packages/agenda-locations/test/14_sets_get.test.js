'use strict';

const Files = require('@openagenda/files');
const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');

describe('agenda-locations - functional - sets get', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getSetAgendasCount: async _setUid => 14,
      },
      Files: Files(dConfig.files),
    });
  });

  it('basic get gets uid and title', async () => {
    const set = await svc.sets.get(1903810);

    expect(set).toStrictEqual({
      uid: 1903810,
      title: 'Les lieux du département Ardèchois',
    });
  });

  it('detailed get gets total of linked agendas', async () => {
    const set = await svc.sets.get(1903810, { detailed: true });

    expect(set).toStrictEqual({
      uid: 1903810,
      title: 'Les lieux du département Ardèchois',
      agendasCount: 14,
      locationsCount: 4,
    });
  });
});
