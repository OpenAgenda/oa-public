'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({ cwd: __dirname });

const config = require('../testconfig');

const Service = require('..');

describe('02 - event -search - functional: languages filter and aggregation', () => {
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
    await service('languages').rebuild({
      eventsList: async (_lastId, _limit) => load(
        'fixtures/02_events.languages.json',
      ),
    });
  });

  it('languages filter filters on single language', async () => {
    const { events: frenchEvents } = await service('languages').search({
      languages: 'fr',
    });

    expect(frenchEvents.map(e => e.uid)).toEqual([1, 3]);

    const { events: englishEvents } = await service('languages').search({
      languages: 'en',
    });

    expect(englishEvents.map(e => e.uid)).toEqual([1]);
  });

  it('languages filter filters on several languages', async () => {
    const { events: frenchAndGermanEvents } = await service('languages').search({
      languages: ['de', 'fr'],
    });

    expect(frenchAndGermanEvents.map(e => e.uid)).toEqual([
      1, 3, 4,
    ]);
  });

  it('languages aggregation', async () => {
    const { aggregations } = await service('languages').search({
      state: null,
    }, {}, { detailed: true, aggregations: 'languages' });

    expect(aggregations.languages).toEqual([
      { key: 'fr', eventCount: 2 },
      { key: 'de', eventCount: 1 },
      { key: 'en', eventCount: 1 },
    ]);
  });
});
