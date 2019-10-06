'use strict';

const _ = require('lodash');
const should = require('should');
const config = require('../config.test');
const createInstance = require('../').createInstance;
const fixtures = require('./fixtures');
const Tracker = require('./utils').Tracker;

describe('Aggregators set', () => {
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

    results.push(await svc.set(999, {
      rules: []
    }));

    results.push(await svc.set(998));
  });

  after(f.destroyClient);

  it('first operation was an update', () => {
    results[0].operation.should.equal('update');
  });

  it('second operation was a create', () => {
    results[1].operation.should.equal('create');
  });

  it('aggregator entry references review id', async () => {
    const entry = await f.client('aggregator').first('*').where('review_id', 219);

    entry.store.should.equal('{"rules":[]}');
  });


});
