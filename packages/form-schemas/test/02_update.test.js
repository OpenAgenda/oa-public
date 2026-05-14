import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../server/index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';
import formSchemaData from './parse/integer.schema.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('form-schemas -02- functional (server): update', () => {
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

  it('simple update', async () => {
    const result = await svc.update(1, formSchemaData);

    expect(result).toEqual({
      id: 1,
      success: true,
      formSchema: formSchemaData,
    });
  });
});
