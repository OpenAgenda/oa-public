import Service from '../server/index.js';
import config from '../testconfig.js';
import fixtures from './service/fixtures.js';
import formSchemaData from './parse/integer.schema.json';

describe('form-schemas -02- functional (server): update', () => {
  let svc;

  beforeAll(async () => {
    await fixtures(config.mysql, ['reset.sql', 'form_schema.data.sql']);
  });

  beforeAll(() => {
    config.mysql.database = 'oatest_fs';
    svc = Service(config);
  });

  afterAll(() => {
    svc.internals.client.destroy();
  });

  it('simple update', async () => {
    const result = await svc.update(1, formSchemaData);

    expect(result).toEqual({
      id: 1,
      success: true,
      formSchema: formSchemaData,
    });
  });
});
