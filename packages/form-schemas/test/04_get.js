'use strict';

const should = require('should');

const Service = require( '../');
const fixtures = require('./service/fixtures');
const config = require('../testconfig');

const fx = {
  schemas: {
    integer: require('./parse/integer.schema.json'),
    number: require('./parse/number.schema')
  }
};

describe('form-schemas -04- functional (server): get', () => {
  let svc;
  let id;
  let secondId;

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      'form_schema.data.sql'
    ]);
  });

  before(() => {
    config.mysql.database = 'oatest_fs';
    svc = Service(config);
  });

  before(async () => {
    id = (await svc.create(fx.schemas.integer)).id;
    secondId = (await svc.create(fx.schemas.number)).id;
  });

  after(() => {
    svc.internals.client.destroy();
  });

  it('simple get', async () => {
    const result = await svc.get(id);

    result.should.eql({
      ...fx.schemas.integer,
      id
    });
  });

  it('get instanciated', async () => {
    const fs = await svc.get(id, { instanciate: true });

    fs.isNew().should.equal(false);
  });

  it('simple getValidator', async () => {
    const validate = await svc.getValidator(id);

    validate({
      participants: 1,
      someIgnoredField: 'lol'
    }).should.eql({
      participants: 1
    });
  });

  it('get merged schemas', async () => {
    const fs = await svc.getMerged([id, secondId]);

    fs.fields.length.should.equal(2);
  });

  it('get merged schemas, instanciated', async () => {
    const fs = await svc.getMerged([id, secondId], { instanciate: true });

    (typeof fs.getValidate()).should.equal('function');
  });

});
