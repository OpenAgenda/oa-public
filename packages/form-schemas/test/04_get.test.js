import Service from '../server/index.js';
import config from '../testconfig.js';
import fixtures from './service/fixtures.js';
import integer from './parse/integer.schema.json';
import number from './parse/number.schema.js';

const fx = {
  schemas: {
    integer,
    number,
  },
};

describe('form-schemas -04- functional (server): get', () => {
  let svc;
  let id;
  let secondId;

  beforeAll(async () => {
    await fixtures(config.mysql, ['reset.sql', 'form_schema.data.sql']);
  });

  beforeAll(() => {
    config.mysql.database = 'oatest_fs';
    svc = Service(config);
  });

  beforeAll(async () => {
    id = (await svc.create(fx.schemas.integer)).id;
    secondId = (await svc.create(fx.schemas.number)).id;
  });

  afterAll(() => {
    svc.internals.client.destroy();
  });

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
