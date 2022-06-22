'use strict';

const Service = require('../server');
const config = require('../testconfig');
const fixtures = require('./service/fixtures');

describe('form-schemas -01- functional (server): create', () => {
  let svc;

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

  afterAll(() => {
    svc.internals.client.destroy();
  });

  it('simple create', async () => {
    const result = await svc.create({
      data: true
    });

    expect(result).toStrictEqual({
      success: true,
      id: 2,
      formSchema: {
        custom: null,
        defaultLabelLanguage: null,
        nextOptionId: 1,
        fields: []
      }
    });
  });
});
