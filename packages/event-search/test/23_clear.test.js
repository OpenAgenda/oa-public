'use strict';

const fs = require('node:fs');

const config = require('../testconfig');
const Service = require('..');

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
        JSON.parse(
          fs.readFileSync(
            `${__dirname}/fixtures/applied/bordeaux-metropole.${lastId}.${limit}.json`,
          ),
        ),
    });
    await service('bd20202notCleared').rebuild({
      eventsList: async (lastId, limit) =>
        JSON.parse(
          fs.readFileSync(
            `${__dirname}/fixtures/applied/bd2020.${lastId}.${limit}.json`,
          ),
        ),
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
