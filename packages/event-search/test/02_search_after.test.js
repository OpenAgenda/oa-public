import Service from '../index.js';
import config from '../testconfig.js';

describe('02 - event search - functional: timings sorting', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);
    await service.getConfig().client.indices.delete({
      index: 'test',
    });
  });

  beforeAll(() =>
    service('after').rebuild({
      eventsList: async (_lastId, _limit) =>
        (await import('./fixtures/02_events.after.json', { type: 'json' }))
          .default,
    }));

  it('after values are strings', async () => {
    const { sort } = await service('after').search({}, { size: 2 });

    sort.forEach((sortKey) => {
      expect(typeof sortKey).toBe('string');
    });
  });

  it('after is null when no further results are available', async () => {
    const { sort } = await service('after').search({}, { size: 4 });

    expect(sort).toBeNull();
  });
});
