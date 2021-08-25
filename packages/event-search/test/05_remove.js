'use strict';

const fs = require('fs');
const should = require('should');
const config = require('../testconfig');
const Service = require('../');

describe('05 - event search - functional: remove', function() {
  let service;

  this.timeout(20000);

  before(async () => {
    service = Service(config);

    await service('05_remove').rebuild({
      eventsList: async (lastId, limit) => {
        return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/05_events.${lastId}.${limit}.json`));
      }
    });
  });

  it('remove an event from set by uid', async () => {
    let result = await service('05_remove').remove({
      uid: 1
    }, { refresh: true });

    result.success.should.equal(true);
  });

  it('not found is thrown', async () => {
    let error;
    try {
      await service('05_remove').remove({
        uid: 2903
      }, { refresh: true });
    } catch (e) {
      error = e;
    }

    error.name.should.equal('NotFound');
  });
});
