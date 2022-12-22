'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event -search - functional: status filter and aggregation', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // console.log(e);
    }
  });

  beforeAll(async () => {
    await service('status').rebuild({
      eventsList: async (_lastId, _limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.status.json`),
      ),
    });
  });

  it('status filter filters', async () => {
    const { events } = await service('status').search({
      status: 4,
    });

    expect(events.length).toBe(1);
    expect(events[0].status).toBe(4);
  });

  it('status aggregation aggregates', async () => {
    const { aggregations } = await service('status').search({}, { size: 0 }, {
      aggregations: 'status',
    });

    expect(aggregations.status).toEqual([{
      key: 1,
      eventCount: 2,
    }, {
      key: 4,
      eventCount: 1,
    }]);
  });
});
