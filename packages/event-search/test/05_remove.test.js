import Service from '../index.js';
import config from '../testconfig.js';

describe('05 - event search - functional: remove', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    await service('05_remove').rebuild({
      eventsList: async (lastId, limit) =>
        (
          await import(`./fixtures/05_events.${lastId}.${limit}.json`, {
            with: { type: 'json' },
          })
        ).default,
    });
  });

  it('remove an event from set by uid', async () => {
    const result = await service('05_remove').remove(
      {
        uid: 1,
      },
      { refresh: true },
    );

    expect(result.success).toBe(true);
  });

  it('not found is thrown', async () => {
    let error;
    try {
      await service('05_remove').remove(
        {
          uid: 2903,
        },
        { refresh: true, soft: false },
      );
    } catch (e) {
      error = e;
    }

    expect(error.name).toBe('NotFound');
  });

  it('Error is thrown when incompatible sort is provided with removed', async () => {
    const error = await service('05_removed')
      .search({ sort: 'timings.asc' }, {}, { removed: null })
      .catch((e) => e);

    expect(error.name).toBe('BadRequest');
  });

  it('Error is not thrown when compatible sort is provided with removed option', async () => {
    const { error } = await service('05_removed')
      .search({ sort: 'updatedAt.asc' }, {}, { removed: null })
      .then((r) => ({ response: r }))
      .catch((e) => ({ error: e }));

    expect(error).toBeUndefined();
  });
});
