import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('networks - functional ( server ): update', () => {
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

    network = await svc.update(13, {
      title: 'Ville de Genève',
      formSchemaId: 123,
    });

    await svc.patch(13, {
      formSchemaId: 456,
    });
  });

  afterAll(() => knex?.destroy());

  it('update returns updated network object', async () => {
    expect(network.title).toBe('Ville de Genève');

    expect(network.uid).toBe(13);
  });

  it('update commits network to db', async () => {
    const fromDb = await knex('network').first('title').where('uid', 13);

    expect(fromDb.title).toBe('Ville de Genève');
  });

  it('patch updates specified value only', async () => {
    const fromDb = await knex('network')
      .first(['title', 'form_schema_id'])
      .where('uid', 13);

    expect(fromDb.form_schema_id).toBe(456);
  });
});
