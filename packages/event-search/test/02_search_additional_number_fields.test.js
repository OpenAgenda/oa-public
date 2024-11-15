import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/02_events.number_additional.json' with { type: 'json' };

describe('02 - event search - functional: filter on integer or number additional fields', () => {
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
    await service('additionalNumbers').rebuild({
      eventsList: async (_lastId, _limit) => fixtures.data,
      formSchema: fixtures.formSchema,
    });
  });

  it('filters on a number bracket', async () => {
    const { events } = await service('additionalNumbers').search(
      {
        price: { gt: 15, lt: 50 },
      },
      {},
      {
        formSchema: fixtures.formSchema,
        detailed: true,
      },
    );

    expect(events.map((e) => e.uid)).toEqual([1, 2]);
  });

  it('if lt is greater then gt, no error is generated but no result is returned', async () => {
    const { events } = await service('additionalNumbers').search(
      {
        price: { gt: 50, lt: 15 },
      },
      {},
      {
        formSchema: fixtures.formSchema,
        detailed: true,
      },
    );

    expect(events.length).toBe(0);
  });
});
