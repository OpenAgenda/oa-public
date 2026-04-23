'use strict';

const Files = require('@openagenda/files');
const Service = require('..');
const { service: config, dependencies: dConfig } = require('./testconfig');

const setup = require('./fixtures/setup');

describe('agenda-locations - functional - sets list', () => {
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
      interfaces: {},
      Files: Files(dConfig.files),
    });
  });

  afterAll(() => knex?.destroy());

  it('basic list gets uids and titles', async () => {
    const sets = await svc.sets.list();
    expect(sets).toStrictEqual([
      {
        uid: 1903810,
        title: 'Les lieux du département Ardèchois',
      },
      {
        uid: 1903811,
        title: 'Les autres lieux du département Ardèchois',
      },
      {
        uid: 1903812,
        title: 'Les lieux du Bouchonnois',
      },
    ]);
  });
});
