import Service from '../index.js';
import config from '../testconfig.js';

describe('03 - event search - functional: sort explanations', () => {
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
    await service('sort_explanations').rebuild({
      eventsList: async (_lastId, _limit) =>
        (
          await import('./fixtures/02_events.locations_sort.json', {
            type: 'json',
          })
        ).default,
    });
  });

  it('default sort includes sort with featured, timings, and lastTiming', async () => {
    const { events } = await service('sort_explanations').search(
      {},
      { size: 1 },
      { includeSort: true },
    );

    expect(events[0].sort).toStrictEqual([
      { key: 'featured', value: false },
      { key: 'relative', value: 'upcoming' },
      { key: 'lastTiming', value: '2099-09-07T08:30:00.000Z' },
    ]);
  });

  it('location sort includes region and city in sort', async () => {
    const { events } = await service('sort_explanations').search(
      {
        sort: ['location.adminLevel1.asc', 'location.city.asc'],
      },
      { size: 2 },
      { detailed: true, includeSort: true },
    );
    expect(events[0].sort).toStrictEqual([
      { key: 'location.adminLevel1', value: 'A' },
      { key: 'location.adminLevel4', value: 'A' },
    ]);
    expect(events[1].sort).toStrictEqual([
      { key: 'location.adminLevel1', value: 'A' },
      { key: 'location.adminLevel4', value: 'B' },
    ]);
  });

  it('location + timings sort includes all fields in sort', async () => {
    const { events } = await service('sort_explanations').search(
      {
        sort: ['location.region.asc', 'location.city.asc', 'timings.asc'],
      },
      { size: 1 },
      { detailed: true, includeSort: true },
    );

    expect(events[0].sort).toBeDefined();
    expect(events[0].sort.length).toBe(4);
    expect(events[0].sort).toStrictEqual([
      { key: 'location.adminLevel1', value: 'A' },
      { key: 'location.adminLevel4', value: 'A' },
      { key: 'relative', value: 'passed' },
      { key: 'lastTiming', value: '2020-09-05T08:30:00.000Z' },
    ]);
  });

  it('featured sort includes featured value in sort', async () => {
    const { events } = await service('sort_explanations').search(
      {
        sort: 'timingsWithFeatured.asc',
      },
      { size: 1 },
      { includeSort: true },
    );

    expect(events[0].sort).toBeDefined();
    expect(events[0].sort).toStrictEqual([
      { key: 'featured', value: false },
      { key: 'relative', value: 'upcoming' },
      { key: 'lastTiming', value: '2099-09-07T08:30:00.000Z' },
    ]);
  });

  it('sort handles null values', async () => {
    const { events } = await service('sort_explanations').search(
      {},
      { size: 1 },
      { includeSort: true },
    );

    events[0].sort.forEach((item) => {
      expect(item.value).toBeDefined();
    });
  });

  it('score sort includes score value when searching with text', async () => {
    const { events } = await service('sort_explanations').search(
      {
        search: 'Bulle',
        sort: 'score',
      },
      { size: 2 },
      { includeSort: true },
    );

    expect(events[0].sort).toBeDefined();
    expect(events[0].sort.length).toBe(1);
    expect(events[0].sort[0].key).toBe('search');
    expect(typeof events[0].sort[0].value).toBe('number');
    expect(events[0].sort[0].value).toBeGreaterThan(0);

    expect(events[0].sort[0].value).toBeGreaterThanOrEqual(
      events[1].sort[0].value,
    );
  });
});
