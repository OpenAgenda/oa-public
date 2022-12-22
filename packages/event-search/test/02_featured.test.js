'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: relative filter', () => {
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
    await service('featured').rebuild({
      eventsList: async (_lastId, _limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.featured.json`),
      ),
    });
  });

  it('default sort puts featured events first', async () => {
    const { events } = await service('featured').search();

    expect(events[0].uid).toBe(1);
  });

  it('featured filter to true limits results to filtered events', async () => {
    const { events } = await service('featured').search({
      featured: true,
    });

    expect(events.length).toBe(1);
    expect(events[0].featured).toBe(true);
  });

  it('featured filter to false excludes featured events from results', async () => {
    const { events } = await service('featured').search({
      featured: false,
    });

    expect(events.length).toBe(2);
    expect(events[0].featured).toBe(false);
  });
});
