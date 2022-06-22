'use strict';

const Service = require('../server');
const config = require('../testconfig');
const fixtures = require('./service/fixtures');

const integer = require('./parse/integer.schema.json');
const number = require('./parse/number.schema');

const fx = {
  schemas: {
    integer,
    number,
  }
};

describe('form-schemas -04- functional (server): get', () => {
  let svc;
  let id;
  let secondId;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      'form_schema.data.sql'
    ]);
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
    expect(result).toStrictEqual({
      ...fx.schemas.integer,
      id
    });
  });

  it('get instanciated', async () => {
    const fs = await svc.get(id, { instanciate: true });

    expect(fs.isNew()).toBeFalsy();
  });

  it('simple getValidator', async () => {
    const validate = await svc.getValidator(id);

    expect(validate({
      participants: 1,
      someIgnoredField: 'lol'
    })).toStrictEqual({ participants: 1 });
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
