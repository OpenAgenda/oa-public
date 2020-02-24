"use strict";

const _ = require('lodash');
const should = require('should');

const Service = require('../server');
const config = require('../testconfig');
const fixtures = require('./service/fixtures');

describe('form-schemas -07- functional (server): legacy', function() {
  let svc;

  this.timeout(5000);

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      'form_schema.data.sql',
      'network.data.sql',
      'legacy_agenda.data.sql',
      'legacy_tag_set.data.sql',
      'legacy_category_set.data.sql'
    ]);
  });

  before(() => {
    config.mysql.database = 'oatest_fs';
    svc = Service(config);
  });

  after(() => {
    svc.internals.client.destroy();
  });

  describe('get', () => {
    let formData;

    before(async () => {
      formData = await svc.legacy.get(3868);
    });

    it('fetches and parses categorySet, tagSet and customSet of given agenda to produce a valid FormSchema', async () => {
      formData.fields.length.should.equal(8);
    });

    it('specifies field origin in origin key', async () => {
      const origins = formData.fields.map(f => f.origin);

      origins.should.eql([
        'custom',
        'custom',
        'custom',
        'custom',
        'custom',
        'tags',
        'tags',
        'categories'
      ]);
    });

    it('specifies if field is network field', async () => {
      const { fields } = await svc.legacy.get(3868);

      _.find(fields, { field: 'quisuisje' }).network.should.equal(true);
    });
  });

  describe('transfer', () => {

    let result;

    before(async () => {
      result = await svc.legacy.transfer(3868);
    });

    it('performs a legacy get followed by a create operation', async () => {
      result.transfered.should.equal(true);

      result.operation.should.equal('create');
    });

    it('does not keep network fields', async () => {
      should(_.find(result.formSchema.fields, { field: 'quisuisje' })).equal(undefined);
    });

    it('performs an update when form_schema_id is already set in agenda', async () => {
      const result = await svc.legacy.transfer(3868);

      result.operation.should.equal('update');
    });

  });

});
