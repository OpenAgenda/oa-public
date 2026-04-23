import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../server/index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('form-schemas -03- functional (server): remove', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/formSchema.data.sql`],
    });
    svc = Service({ ...config, knex });
  });

  afterAll(() => knex?.destroy());

  it('simple remove', async () => {
    const { client } = svc.internals;

    const { id } = await svc.create({
      data: true,
    });

    const lenBeforeRemove = (
      await client(config.schemas.formSchema).where({ id })
    ).length;
    const removeRet = await svc.remove(id);
    const lenAfterRemove = (
      await client(config.schemas.formSchema).where({ id })
    ).length;
    expect([lenBeforeRemove, lenAfterRemove, removeRet]).toStrictEqual([
      1,
      0,
      { success: true, id },
    ]);
  });
});
