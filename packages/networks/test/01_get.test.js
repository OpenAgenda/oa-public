import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('network - functional ( server ): get', () => {
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

  it('get gets', async () => {
    expect(await svc.get(1)).toEqual({
      uid: 1,
      formSchemaId: 2,
      title: 'Métropole de Toulouse',
    });
  });
});
