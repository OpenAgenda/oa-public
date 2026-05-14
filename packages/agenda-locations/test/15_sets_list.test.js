import Files from '@openagenda/files';
import Service from '../index.js';
import testconfig from './testconfig.js';

import setup from './fixtures/setup.js';

const { service: config, dependencies: dConfig } = testconfig;

describe('agenda-locations - functional - sets list', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${import.meta.dirname}/fixtures/ardeche/rows.sql`],
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
