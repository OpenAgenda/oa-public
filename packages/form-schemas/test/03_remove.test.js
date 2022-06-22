'use strict';

process.env.NODE_ENV = 'test';

const Service = require('../server');
const config = require('../testconfig');
const fixtures = require('./service/fixtures');

describe('form-schemas -03- functional (server): remove', () => {
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

  it('simple remove', async () => {
    const { client } = svc.internals;

    const { id } = await svc.create({
      data: true
    });

    const lenBeforeRemove = (await client('form_schema').where({ id })).length;
    const removeRet = await svc.remove(id);
    const lenAfterRemove = (await client('form_schema').where({ id })).length;
    expect([lenBeforeRemove, lenAfterRemove, removeRet]).toStrictEqual([1, 0, { success: true, id }]);
  });
});
