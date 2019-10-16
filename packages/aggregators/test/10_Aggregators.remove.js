'use strict';

const _ = require('lodash');
const should = require('should');
const config = require('../config.test');
const createInstance = require('../').createInstance;
const fixtures = require('./fixtures');
const Tracker = require('./utils').Tracker;

describe('Aggregators remove', () => {
  const f = fixtures(config.mysql);
  let svc;
  const tracker = Tracker();
  const results = [];

  before(async () => {
    await f.load();

    svc = createInstance({
      knex: f.client,
      queues: queueName => Object.assign(tracker.bind(null, 'queue'),{
        register: tracker('register'),
        on: tracker('on')
      }),
      interfaces: {}
    });
  });

  after(f.destroyClient);

  it('remove is successful', async () => {
    const result = await svc.remove(999);
    result.success.should.equal(true);
  });

  it('error is thrown if aggregator to be removed is not found', async () => {
    let err;
    try {
      await svc.remove(92929);
    } catch (e) {
      err = e;
    }

    err.message.should.equal('Aggregator not found');
  });

});
