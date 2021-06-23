'use strict';

const assert = require('assert');
const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event -search - functional: status filter and aggregation', () => {
  let service;

  before(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  before(async () => {
    await service('status').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.status.json`)
      )
    })
  });

  it('status filter filters', async () => {
    const { events } = await service('status').search({
      status: 4
    });
    
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].status, 4);
  });

  it('status aggregation aggregates', async () => {
    const { aggregations } = await service('status').search({}, { size: 0 }, {
      aggregations: 'status'
    });

    assert.deepStrictEqual(aggregations.status, [{
      key: 1,
      eventCount: 2
    }, {
      key: 4,
      eventCount: 1
    }]);
  });
});