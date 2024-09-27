'use strict';

const fs = require('node:fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: removed', () => {
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
    await service('removed').rebuild({
      eventsList: async (_lastId, _limit) =>
        JSON.parse(
          fs.readFileSync(`${__dirname}/fixtures/02_events.removed.json`),
        ),
    });
  });

  it('removed true', async () => {
    const { events } = await service('removed').search(
      {},
      { size: 2 },
      {
        removed: true,
      },
    );

    expect(events.length).toBe(1);
    expect(events[0].removed).toBe(true);
  });

  it('removed false', async () => {
    const { events } = await service('removed').search(
      {},
      { size: 10 },
      {
        removed: false,
      },
    );

    expect(events.length).toBe(9);
    expect(events.filter((e) => e.removed).length).toBe(0);
  });

  it('removed null', async () => {
    const { events } = await service('removed').search(
      {},
      { size: 10 },
      {
        removed: null,
      },
    );

    expect(events.length).toBe(10);
    expect(events.filter((e) => e.removed).length).toBe(1);
  });

  it('sort with removed null', async () => {
    const { events } = await service('removed').search(
      {},
      { size: 10 },
      {
        removed: null,
      },
    );

    expect(events.map((e) => e.uid)).toStrictEqual([
      5, 3, 13, 14, 18, 19, 20, 21, 30, 31,
    ]);
  });
});
