'use strict';

const should = require('should');
const config = require('../testconfig');
const Service = require('../');

describe('19 - event-search - functional: deleteFloatingIndices', function() {
  let service, deletedIndices;

  before(() => {
    service = Service(config);
  });

  before(async () => {
    const client = service.getConfig().client;

    await client.indices.create({ index: 'bob' });
  });

  before(async () => {
    deletedIndices = await service.deleteFloatingIndices();
  });

  it('returns names of deleted indices', () => {
    deletedIndices.filter(i => i==='bob').length.should.equal(1);
  });

  it('indices are deleted', async () => {
    const client = service.getConfig().client;
    let error;

    try {
      await client.cat.indices({
        index: deletedIndices,
        format: 'json',
        h: 'index'
      });
    } catch (e) { error = e; }

    error.message.should.equal('index_not_found_exception');
  });

});
