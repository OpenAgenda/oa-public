'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: addMethod', () => {
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
    await service('addMethod').rebuild({
      eventsList: async (_lastId, _limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.addMethod.json`),
      ),
    });
  });

  it(
    'addMethod info is provided if detailed option is specified',
    async () => {
      const { events } = await service('addMethod').search({

      }, {}, { detailed: true });

      expect(
        events.map(e => e.addMethod),
      ).toEqual(
        ['contribution', 'share', 'aggregation'],
      );
    },
  );

  it('addMethod filter on "share" and "aggregation"', async () => {
    const { events } = await service('addMethod').search({
      addMethod: ['share', 'aggregation'],
    }, {}, { detailed: true });

    expect(events.map(e => e.addMethod)).toEqual(
      ['share', 'aggregation'],
    );
  });

  it('addMethod is a possible aggregation', async () => {
    const { aggregations } = await service('addMethod').search({
      state: null,
    }, {}, {
      detailed: true,
      aggregations: 'addMethods',
    });

    expect(aggregations.addMethods).toEqual([
      { key: 'contribution', eventCount: 2 },
      { key: 'aggregation', eventCount: 1 },
      { key: 'share', eventCount: 1 },
    ]);
  });
});
