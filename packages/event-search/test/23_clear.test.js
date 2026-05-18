import Service from '../index.js';
import config from '../testconfig.js';

describe('02 - event search - functional: clear a set', () => {
  let service;
  let totalBefore;
  let deleteResponse;
  beforeAll(() => {
    service = Service(config);
  });

  beforeAll(async () => {
    try {
      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // console.log(e);
    }
  });

  beforeAll(async () => {
    await service('bdx2clear').rebuild({
      eventsList: async (lastId, limit) =>
        (
          await import(
            `./fixtures/applied/bordeaux-metropole.${lastId}.${limit}.json`
          )
        ).default,
    });
    await service('bd20202notCleared').rebuild({
      eventsList: async (lastId, limit) =>
        (
          await import(`./fixtures/applied/bd2020.${lastId}.${limit}.json`, {
            with: { type: 'json' },
          })
        ).default,
    });
  });

  beforeAll(async () => {
    const response = await service('bdx2clear').search(
      { state: null },
      { size: 0 },
    );

    totalBefore = response.total;

    deleteResponse = await service('bdx2clear').clear();
  });

  afterAll(async () => {
    await service('bd20202notCleared').clear();
  });

  test('all events of set are cleared', async () => {
    expect(totalBefore).toBeGreaterThan(0);

    expect(deleteResponse.deleted).toBe(totalBefore);
  });

  test('events of neighboring set are not affected', async () => {
    const { total } = await service('bd20202notCleared').search(
      { state: null },
      { size: 0 },
    );

    expect(total).toBeGreaterThan(0);
  });
});
