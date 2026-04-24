'use strict';

const Files = require('@openagenda/files');
const Service = require('..');
const { service: config, dependencies: dConfig } = require('./testconfig');

const setup = require('./fixtures/setup');

describe('agenda-locations - functional - sets get', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/ardeche/rows.sql`],
    });

    svc = Service({
      knex,
      interfaces: {
        getSetAgendasCount: async (_setUid) => 14,
      },
      Files: Files(dConfig.files),
    });
  });

  afterAll(() => knex?.destroy());

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
