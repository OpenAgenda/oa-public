import Service from '../index.js';
import config from '../testconfig.js';

describe('02 - event search - functional: extIds', () => {
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
    await service('extIds').rebuild({
      eventsList: async (_lastId, _limit) =>
        (await import('./fixtures/02_events.extIds.json', { type: 'json' }))
          .default,
    });
  });

  it('basic', async () => {
    const { events } = await service('extIds').search(
      {},
      {},
      { detailed: true },
    );

    expect(events.length).toBe(3);
  });

  it('search by extId', async () => {
    const { events } = await service('extIds').search(
      {
        extIds: { key: 'apidae', value: '43434' },
      },
      {},
      { detailed: true },
    );

    expect(events.length).toBe(1);
    expect(events[0].extIds[0].key).toBe('apidae');
    expect(events[0].extIds[0].value).toBe('43434');
  });
});
