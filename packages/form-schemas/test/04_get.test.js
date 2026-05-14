import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../server/index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';
import integer from './parse/integer.schema.json' with { type: 'json' };
import number from './parse/number.schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const fx = {
  schemas: {
    integer,
    number,
  },
};

describe('form-schemas -04- functional (server): get', () => {
  let knex;
  let svc;
  let id;
  let secondId;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/formSchema.data.sql`],
    });
    svc = Service({ ...config, knex });

    id = (await svc.create(fx.schemas.integer)).id;
    secondId = (await svc.create(fx.schemas.number)).id;
  });

  afterAll(() => knex?.destroy());

  it('simple get', async () => {
    const result = await svc.get(id);
    expect(result).toEqual({
      ...fx.schemas.integer,
      id,
    });
  });

  it('get instanciated', async () => {
    const fs = await svc.get(id, { instanciate: true });

    expect(fs.isNew()).toBeFalsy();
  });

  it('simple getValidator', async () => {
    const validate = await svc.getValidator(id);

    expect(
      validate({
        participants: 1,
        someIgnoredField: 'lol',
      }),
    ).toStrictEqual({ participants: 1 });
  });

  it('get merged schemas', async () => {
    const fs = await svc.getMerged([id, secondId]);

    expect(fs.fields.length).toBe(2);
  });

  it('get merged schemas, instanciated', async () => {
    const fs = await svc.getMerged([id, secondId], { instanciate: true });

    expect(typeof fs.getValidate()).toBe('function');
  });
});
