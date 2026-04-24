import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../server/index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('form-schemas -01- functional (server): create', () => {
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

  it('simple create', async () => {
    const result = await svc.create({
      data: true,
    });

    expect(result).toStrictEqual({
      success: true,
      id: 2,
      formSchema: {
        custom: null,
        defaultLabelLanguage: null,
        nextOptionId: 1,
        fields: [],
      },
    });
  });
});
