'use strict';

const fs = require('fs');
const should = require('should');

const Service = require( '../server');
const config = require('../testconfig');
const fixtures = require('./service/fixtures');

const formSchemaData = require('./parse/integer.schema.json');

describe('form-schemas -02- functional (server): update', () => {
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

  it('simple update', async () => {
    (await svc.update(1, formSchemaData)).should.eql({
      id: 1,
      success: true,
      formSchema: formSchemaData
    });
  });
});
