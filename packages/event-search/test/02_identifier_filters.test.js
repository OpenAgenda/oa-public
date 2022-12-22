'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - funcional: identifier filters', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({ index: 'test' });
    } catch (e) {
      // console.log(e);
    }
  });

  beforeAll(async () => {
    await service('identifier').rebuild({
      eventsList: async (_lastId, _limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.identifier.json`),
      ),
    });
  });

  it('filter by event uid', async () => {
    const {
      events,
    } = await service('identifier').search({
      uid: 1,
    });

    expect(events.length).toBe(1);
    expect(events[0].uid).toBe(1);
  });

  it('filter by multiple event uids', async () => {
    const {
      events,
    } = await service('identifier').search({
      uid: [1, 2],
    });

    expect(events.length).toBe(2);
    expect(events.map(e => e.uid)).toEqual([1, 2]);
  });

  it('filter by owner uid', async () => {
    const {
      events,
    } = await service('identifier').search({
      ownerUid: 1,
    });

    expect(events.length).toBe(2);
    expect(events.map(e => e.uid)).toEqual([1, 2]);
  });

  it('filter by multiple owner uids', async () => {
    const {
      events,
    } = await service('identifier').search({
      ownerUid: [1, 2],
    });

    expect(events.length).toBe(4);
    expect(events.map(e => e.uid)).toEqual([1, 2, 3, 4]);
  });

  it('filter by ownerOrMemberUid', async () => {
    const {
      events,
    } = await service('identifier').search({
      ownerOrMemberUid: 1,
    }, {}, {
      detailed: 1,
    });

    expect(
      events.map(e => e.uid),
    ).toEqual(
      [1, 2, 5],
    );
  });
});
