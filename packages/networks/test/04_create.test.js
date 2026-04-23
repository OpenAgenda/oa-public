import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('networks - functional ( server ): create', () => {
  let knex;
  let svc;
  let network;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: { network: config.schema },
      data: [`${__dirname}/fixtures/network.data.sql`],
    });

    svc = Service({ knex, schema: config.schema });

    network = await svc.create({ title: 'Reykjavik Métropole' });
  });

  afterAll(() => knex?.destroy());

  it('create returns created network object', async () => {
    expect(network.title).toBe('Reykjavik Métropole');

    expect(network.uid).toBeGreaterThan(0);
  });

  it('create commits network to db', async () => {
    const fromDb = await knex('network')
      .first('title')
      .where('uid', network.uid);

    expect(fromDb.title).toBe('Reykjavik Métropole');
  });
});
