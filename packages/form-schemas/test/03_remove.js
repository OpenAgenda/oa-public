'use strict';

process.env.NODE_ENV = 'test';

const should = require('should');

const Service = require( '../');
const fixtures = require('./service/fixtures');
const config = require( '../testconfig' );

describe('form-schemas -03- functional (server): remove', () => {
  let svc;

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

  after(() => {
    svc.internals.client.destroy();
  });

  it('simple remove', async () => {
    const client = svc.internals.client;

    const { id } = await svc.create({
      data: true
    });

    (await client('form_schema').where({ id })).length.should.equal(1);

    (await svc.remove(id) ).should.eql({
      success: true,
      id
    });

    (await client('form_schema').where({ id })).length.should.equal(0);
  });

} );
