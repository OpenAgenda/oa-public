import Service from '../index.js';
import config from '../testconfig.js';

describe('02 - event search - functional: valid', () => {
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
    await service('valid').rebuild({
      eventsList: async (_lastId, _limit) =>
        (await import('./fixtures/02_events.valid.json', { type: 'json' }))
          .default,
    });
  });

  it('valid null (default behavior)', async () => {
    const { events } = await service('valid').search({}, { size: 10 });

    // By default (valid: null), should return all events (10 total)
    expect(events.length).toBe(10);
    expect(events.filter((e) => e.valid === true).length).toBe(4);
    expect(events.filter((e) => e.valid === undefined).length).toBe(4);
    expect(events.filter((e) => e.valid === false).length).toBe(2);
  });

  it('valid true', async () => {
    const { events } = await service('valid').search(
      {},
      { size: 10 },
      {
        valid: true,
      },
    );

    // valid: true should return ONLY events with valid === true
    expect(events.length).toBe(4);
    expect(events.filter((e) => e.valid === true).length).toBe(4);
    expect(events.filter((e) => e.valid === undefined).length).toBe(0);
    expect(events.filter((e) => e.valid === false).length).toBe(0);
  });

  it('valid false', async () => {
    const { events } = await service('valid').search(
      {},
      { size: 10 },
      {
        valid: false,
      },
    );

    expect(events.length).toBe(2);
    expect(events.filter((e) => e.valid === false).length).toBe(2);
  });

  it('valid null', async () => {
    const { events } = await service('valid').search(
      {},
      { size: 10 },
      {
        valid: null,
      },
    );

    expect(events.length).toBe(10);
    expect(events.filter((e) => e.valid === true).length).toBe(4);
    expect(events.filter((e) => e.valid === false).length).toBe(2);
    expect(events.filter((e) => e.valid === undefined).length).toBe(4);
  });

  it('sort with valid null', async () => {
    const { events } = await service('valid').search(
      {},
      { size: 10 },
      {
        valid: null,
      },
    );

    expect(events.map((e) => e.uid)).toStrictEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it('aggregation on valid field provides count for events', async () => {
    const { aggregations } = await service('valid').search(
      {},
      { size: 0 },
      {
        aggregations: 'valid',
      },
    );

    // Note: Without the missing parameter, only events with explicit valid values are counted
    expect(aggregations.valid).toEqual([
      {
        key: 'true',
        eventCount: 4,
      },
      {
        key: 'false',
        eventCount: 2,
      },
    ]);
  });
  it('aggregation on valid field provides count for events with missing', async () => {
    const { aggregations } = await service('valid').search(
      {},
      { size: 0 },
      {
        aggregations: [
          {
            key: 'valid',
            type: 'valid',
            missing: 'N/A',
          },
        ],
      },
    );

    // With the missing parameter, includes events without the valid field
    expect(aggregations.valid).toEqual([
      {
        key: 'N/A',
        eventCount: 4,
      },
      {
        key: 'true',
        eventCount: 4,
      },
      {
        key: 'false',
        eventCount: 2,
      },
    ]);
  });
});
