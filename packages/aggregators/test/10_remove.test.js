'use strict';

const _ = require('lodash');
const config = require('../testconfig');
const createInstance = require('../');
const fixtures = require('./fixtures');
const Tracker = require('./utils').Tracker;

describe('10 - remove', () => {
  const f = fixtures(config.mysql);
  let svc;
  const tracker = Tracker();
  const results = [];

  beforeAll(async () => {
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

  afterAll(f.destroyClient);

  test('remove is successful', async () => {
    const result = await svc.remove(999);
    expect(result.success).toBe(true);
  });

  test('error is thrown if aggregator to be removed is not found', async () => {
    let err;
    try {
      await svc.remove(92929);
    } catch (e) {
      err = e;
    }

    expect(err.message).toBe('Aggregator not found');
  });

});
