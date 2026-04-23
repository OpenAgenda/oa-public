import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import _ from 'lodash';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('networks - functional ( server ): list', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: { network: config.schema },
      data: [`${__dirname}/fixtures/network.data.sql`],
    });

    svc = Service({ knex, schema: config.schema });
  });

  afterAll(() => knex?.destroy());

  it('list lists', async () => {
    expect(
      (await svc.list()).map((n) =>
        _.pick(n, ['uid', 'formSchemaId', 'title'])),
    ).toEqual([
      {
        uid: 1,
        formSchemaId: 2,
        title: 'Métropole de Toulouse',
      },
      {
        uid: 13,
        formSchemaId: 12,
        title: 'Métropole de Lille',
      },
      {
        uid: 3,
        formSchemaId: 21,
        title: 'Orléans Métropole',
      },
    ]);
  });
});
