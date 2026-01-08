import Service from '../index.js';
import config from '../testconfig.js';

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
        (
          await import('./fixtures/02_events.locations_sort.json', {
            type: 'json',
          })
        ).default,
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
      81527718, 81527719, 81527720, 81527721, 81527722,
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
      81527718, 81527719, 81527721, 81527720, 81527722,
    ]);
  });

  it('location sort with adminLevels', async () => {
    const result = await service('location_sort').search(
      {
        sort: ['location.adminLevel1.asc', 'location.adminLevel4.asc'],
      },
      { size: 10 },
      { useAfterKey: true, detailed: true },
    );
    // console.log(result.events.map((e) => ({ uid: e.uid, region: e.location.region, city: e.location.city })));
    expect(result.events.map((e) => e.uid)).toStrictEqual([
      81527718, 81527719, 81527720, 81527721, 81527722,
    ]);
  });

  describe('fixs', () => {
    it('location sort on departments', async () => {
      const result = await service('location_sort').search(
        {
          sort: ['location.department.asc'],
        },
        { size: 10 },
        { useAfterKey: true, detailed: true },
      );
      expect(result.events.map((e) => e.location.department)).toStrictEqual([
        'A',
        'A',
        'A',
        'B',
        'C',
      ]);
      expect(result.events.map((e) => e.uid)).toStrictEqual([
        81527718, 81527719, 81527721, 81527720, 81527722,
      ]);
    });
  });
});
