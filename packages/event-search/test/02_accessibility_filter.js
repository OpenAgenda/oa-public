'use strict';

const fs = require('fs');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: filter by accessibility', () => {
  let service;

  before(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  before(() => service('accessibility').rebuild({
    eventsList: async (lastId, limit) => JSON.parse(fs.readFileSync(`${__dirname}/fixtures/02_events.accessibility.json`))
  }));

  it('filters', async () => {
    const { events } = await service('accessibility').search({
      accessibility: ['mi', 'vi']
    }, {}, { detailed: true });

    for (const acc of events.map(e => e.accessibility)) {
      assert(acc.mi || acc.vi);
    }
  });

  it('aggregates', async () => {
    const { aggregations } = await service('accessibility').search({}, {}, { aggregations: 'accessibilities' });

    assert.deepEqual(
      aggregations.accessibilities,
      [
        { key: 'hi', eventCount: 2 },
        { key: 'ii', eventCount: 1 },
        { key: 'mi', eventCount: 1 },
        { key: 'pi', eventCount: 1 },
        { key: 'vi', eventCount: 1 }
      ]
    );
  });
});