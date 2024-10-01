'use strict';

const fs = require('node:fs');

const config = require('../testconfig');

const Service = require('..');

describe('event search - functional: multiple Sort', () => {
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
    await service('location_sort').rebuild({
      eventsList: async (_lastId, _limit) =>
        JSON.parse(
          fs.readFileSync(
            `${__dirname}/fixtures/02_events.locations_sort.json`,
          ),
        ),
    });
  });

  it('location sort', async () => {
    const result = await service('location_sort').search(
      {
        sort: ['location.region.asc', 'location.city.asc'],
      },
      { size: 10 },
      { useAfterKey: true, detailed: true },
    );
    // console.log(result.events.map((e) => ({ uid: e.uid, region: e.location.region, city: e.location.city })));
    expect(result.events.map((e) => e.uid)).toStrictEqual([
      81527718, 81527719, 81527720, 81527721,
    ]);
  });

  it('location sort with timings', async () => {
    const result = await service('location_sort').search(
      {
        sort: ['location.region.asc', 'location.city.asc', 'timings.asc'],
      },
      { size: 10 },
      { useAfterKey: true, detailed: true },
    );
    // console.log(result.events.map((e) => ({ uid: e.uid, region: e.location.region, city: e.location.city, timings: e.timings })));
    expect(result.events.map((e) => e.uid)).toStrictEqual([
      81527718, 81527719, 81527721, 81527720,
    ]);
  });
});
