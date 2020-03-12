'use strict';

const config = require('../testconfig');
const createInstance = require('../');
const fixtures = require('./fixtures');
const { Tracker } = require('./utils');

describe('09 - set and get', () => {
  const f = fixtures(config.mysql);
  let svc;
  const tracker = Tracker();
  const results = [];

  beforeAll(async () => {
    await f.load();

    svc = createInstance({
      knex: f.client,
      queues: () => Object.assign(tracker.bind(null, 'queue'), {
        register: tracker('register'),
        on: tracker('on')
      }),
      interfaces: {}
    });

    results.push(await svc.get(999));

    results.push(
      await svc.set(999, {
        rules: []
      })
    );

    results.push(
      await svc.set(998, {
        rules: [{ value: { state: 2 } }]
      })
    );
  });

  afterAll(f.destroyClient);

  test('get provides clean rules', () => {
    expect(results[0].rules).toEqual([
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

  test('second operation was an update', () => {
    expect(results[1].operation).toBe('update');
  });

  test('third operation was a create', () => {
    expect(results[2].operation).toBe('create');
  });

  test('aggregator entry references review id', async () => {
    const entry = await f
      .client('aggregator')
      .first('*')
      .where('review_id', 219);

    expect(entry.store).toBe(
      '{"rules":[{"query":{},"actions":[{"field":"state","values":{"$set":2}}],"required":true}]}'
    );
  });
});
