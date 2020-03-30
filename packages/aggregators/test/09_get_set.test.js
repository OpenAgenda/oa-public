'use strict';

const config = require('../testconfig');
const { Tracker } = require('./utils');
const fixtures = require('./fixtures');
const createInstance = require('..');

describe('09 - set and get', () => {
  let svc;
  const tracker = Tracker();
  const f = fixtures(config.mysql);

  beforeAll(async () => {
    await f.load([
      'reset.sql',
      '../../model.sql',
      'aggregator.data.json',
      'review.create.sql',
      'review.data.json'
    ]);
  });

  beforeAll(async () => {
    svc = createInstance({
      knex: f.client,
      queues: () => Object.assign(tracker.bind(null, 'queue'), {
        register: tracker('register'),
        on: tracker('on')
      }),
      interfaces: {
        getAggregatedCount: () => 12 // interface arg is agenda uid
      }
    });
  });

  afterAll(f.destroyClient);

  test('get provides clean rules', async () => {
    const result = await svc.get(999);

    expect(result.rules).toEqual([
      {
        query: {},
        actions: [
          {
            field: 'state',
            values: { $set: 2 }
          }
        ],
        required: false
      }
    ]);
  });

  test('update', async () => {
    const result = await svc.set(998, {
      rules: []
    });
    expect(result.operation).toBe('update');
  });

  test('create', async () => {
    const result = await svc.set(222, {
      rules: []
    });
    expect(result.operation).toBe('create');
  });

  test('cannot set limit without options.protected to false', async () => {
    await svc.set(
      333,
      { limit: 2 },
      {
        patch: true
      }
    );

    const entry = await f
      .client('aggregator')
      .first('*')
      .where('review_id', 3);

    expect(entry.limit).toBe(1);
  });

  test('can set limit with options.protected to false', async () => {
    await svc.set(
      444,
      { limit: 2 },
      {
        patch: true,
        protected: false
      }
    );

    const entry = await f
      .client('aggregator')
      .first('*')
      .where('review_id', 4);

    expect(entry.limit).toBe(2);
  });

  test('aggregator entry references review id', async () => {
    const entry = await f
      .client('aggregator')
      .first('*')
      .where('review_id', 218);

    expect(entry.store).toBe(
      '{"rules":[{"value":{"state":2}, "required":false}]}'
    );
  });

  test('patch patches: rules are not overwritten by limit', async () => {
    await svc.set(
      999,
      { limit: 2 },
      {
        patch: true,
        protected: false
      }
    );

    const result = await svc.get(999);

    expect(result.rules.length).toEqual(1);
    expect(result.limit).toEqual(2);
  });

  test('detailed options provides information relative to limit', async () => {
    const result = await svc.get(333, { detailed: true });

    expect(result.aggregatedCount).toEqual(12);
    expect(result.limitIsReached).toEqual(true);
  });
});
