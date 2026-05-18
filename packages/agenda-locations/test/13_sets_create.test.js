import Files from '@openagenda/files';
import Service from '../index.js';
import testconfig from './testconfig.js';

import setup from './fixtures/setup.js';

const { service: config, dependencies: dConfig } = testconfig;

describe('agenda-locations - functional - sets create', () => {
  let knex;
  let svc;
  let created;

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
    expect(
      await knex('location_set').first().where('uid', created.uid),
    ).toBeDefined();
  });

  it('title is in entry', async () => {
    expect(
      await knex('location_set')
        .first()
        .where('uid', created.uid)
        .then((r) => r.title),
    ).toEqual('Un jeu de lieux');
  });
});
