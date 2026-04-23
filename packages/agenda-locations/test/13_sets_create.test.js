'use strict';

const Files = require('@openagenda/files');
const Service = require('..');
const { service: config, dependencies: dConfig } = require('./testconfig');

const setup = require('./fixtures/setup');

describe('agenda-locations - functional - sets create', () => {
  let knex;
  let svc;
  let created;

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
