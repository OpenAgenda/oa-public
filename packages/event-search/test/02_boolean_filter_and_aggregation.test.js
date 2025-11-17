import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/02_events.boolean.json' with { type: 'json' };

describe('02 - event search - functional: boolean type', () => {
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
    await service('boolean').rebuild({
      eventsList: async (_lastId, _limit) => fixtures.list,
      formSchema: fixtures.formSchema,
    });
  });

  it('filter on empty', async () => {
    const { events } = await service('boolean').search(
      {
        trueOrFalse: 'null',
      },
      {},
      {
        formSchema: fixtures.formSchema,
        detailed: true,
      },
    );

    expect(events.length).toBeGreaterThan(0);
    events.forEach((event) => {
      expect(event.trueOrFalse).toBeUndefined();
    });
  });

  it('filter on true', async () => {
    const { events } = await service('boolean').search(
      {
        trueOrFalse: true,
      },
      {},
      {
        formSchema: fixtures.formSchema,
        detailed: true,
      },
    );

    expect(events.length).toBeGreaterThan(0);

    events.forEach((event) => {
      expect(event.trueOrFalse).toBe(true);
    });
  });

  it('both true and false', async () => {
    const { events } = await service('boolean').search(
      {
        trueOrFalse: [true, false],
      },
      {},
      {
        formSchema: fixtures.formSchema,
        detailed: true,
      },
    );
    expect(events.length).toBe(3);
    events.forEach((event) => {
      expect(event.trueOrFalse).toBeDefined();
    });
  });

  it('filter on false', async () => {
    const { events } = await service('boolean').search(
      {
        trueOrFalse: false,
      },
      {},
      {
        formSchema: fixtures.formSchema,
        detailed: true,
      },
    );

    expect(events.length).toBeGreaterThan(0);

    events.forEach((event) => {
      expect(event.trueOrFalse).toBe(false);
    });
  });

  it('filter on originAgenda.official', async () => {
    const { events } = await service('boolean').search(
      {
        originAgenda: { official: true },
      },
      {},
      {
        detailed: true,
      },
    );

    expect(events.length).toBe(1);
    expect(events[0].uid).toBe(4);
  });

  it('aggregation on boolean field provides count for events including unset values count', async () => {
    const { aggregations } = await service('boolean').search(
      {
        state: null,
      },
      { size: 0 },
      {
        formSchema: fixtures.formSchema,
        detailed: true,
        aggregations: [
          {
            key: 'kayonashi',
            field: 'trueOrFalse',
            type: 'additionalFields',
            missing: 'N/A',
          },
        ],
      },
    );

    expect(aggregations.kayonashi).toEqual([
      {
        key: 'N/A',
        eventCount: 1,
      },
      {
        key: 'true',
        eventCount: 2,
      },
      {
        key: 'false',
        eventCount: 1,
      },
    ]);
  });
});
