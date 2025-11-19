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
    const { events } = await service('valid').search(
      { valid: null },
      { size: 10 },
      { detailed: true },
    );

    // valid: null should return only events with undefined valid field
    expect(events.length).toBe(4);
    expect(events.filter((e) => e.valid === undefined).length).toBe(4);
    expect(events.filter((e) => e.valid === true).length).toBe(0);
    expect(events.filter((e) => e.valid === false).length).toBe(0);
  });

  it('valid true', async () => {
    const { events } = await service('valid').search(
      { valid: true },
      { size: 10 },
      { detailed: true },
    );

    // valid: true should return ONLY events with valid === true
    expect(events.length).toBe(4);
    expect(events.filter((e) => e.valid === true).length).toBe(4);
    expect(events.filter((e) => e.valid === undefined).length).toBe(0);
    expect(events.filter((e) => e.valid === false).length).toBe(0);
  });

  it('valid false', async () => {
    const { events } = await service('valid').search(
      { valid: false },
      { size: 10 },
      { detailed: true },
    );

    expect(events.length).toBe(2);
    expect(events.filter((e) => e.valid === false).length).toBe(2);
  });

  it('valid omitted (no filter)', async () => {
    const { events } = await service('valid').search(
      {},
      { size: 10 },
      { detailed: true },
    );

    // When valid field is omitted, should return all events (10 total)
    expect(events.length).toBe(10);
    expect(events.filter((e) => e.valid === true).length).toBe(4);
    expect(events.filter((e) => e.valid === false).length).toBe(2);
    expect(events.filter((e) => e.valid === undefined).length).toBe(4);
  });

  it('valid both true and false', async () => {
    const { events } = await service('valid').search(
      { valid: [true, false] },
      { size: 10 },
      { detailed: true },
    );
    expect(events.length).toBe(6);
    expect(events.filter((e) => e.valid === true).length).toBe(4);
    expect(events.filter((e) => e.valid === false).length).toBe(2);
  });

  it('sort with valid null', async () => {
    const { events } = await service('valid').search(
      { valid: null },
      { size: 10 },
    );

    // valid: null filters for undefined values only (4 events: 6, 7, 8, 9)
    expect(events.map((e) => e.uid)).toStrictEqual([6, 7, 8, 9]);
  });

  it('valid is retuned when detailed', async () => {
    const { events } = await service('valid').search(
      { uid: 1 },
      { size: 10 },
      { detailed: 1 },
    );

    expect(events[0].valid).toBeTruthy();
    expect(events.map((e) => e.uid)).toStrictEqual([1]);
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

  describe('valid field inclusion in results', () => {
    it('valid field is NOT included in non-detailed search by default', async () => {
      const { events } = await service('valid').search(
        { valid: true },
        { size: 10 },
      );

      // valid should not be in the returned event data
      expect(events[0]).not.toHaveProperty('valid');
    });

    it('valid field IS included in detailed search', async () => {
      const { events } = await service('valid').search(
        { valid: true },
        { size: 10 },
        { detailed: true },
      );

      // valid should be in the returned event data
      expect(events[0]).toHaveProperty('valid');
      expect(events[0].valid).toBe(true);
    });

    it('valid field IS included when explicitly requested via includeFields', async () => {
      const { events } = await service('valid').search(
        { valid: true },
        { size: 10 },
        { includeFields: ['valid'] },
      );

      // valid should be in the returned event data
      expect(events[0]).toHaveProperty('valid');
      expect(events[0].valid).toBe(true);
    });
  });
});
