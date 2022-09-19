'use strict';

const fs = require('fs');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - funcional: identifier filters', () => {
  let service;

  before(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({ index: 'test' });
    } catch (e) {}
  });

  before(async () => {
    await service('identifier').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.identifier.json`)
      )
    })
  });

  it('filter by event uid', async () => {
    const {
      events
    } = await service('identifier').search({
      uid: 1
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].uid, 1);
  });

  it('filter by multiple event uids', async () => {
    const {
      events
    } = await service('identifier').search({
      uid: [1, 2]
    });

    assert.equal(events.length, 2);
    assert.deepEqual(events.map(e => e.uid), [1, 2]);
  });

  it('filter by owner uid', async () => {
    const {
      events
    } = await service('identifier').search({
      ownerUid: 1
    });

    assert.equal(events.length, 2);
    assert.deepEqual(events.map(e => e.uid), [1, 2]);
  });

  it('filter by multiple owner uids', async () => {
    const {
      events
    } = await service('identifier').search({
      ownerUid: [1, 2]
    });

    assert.equal(events.length, 4);
    assert.deepEqual(events.map(e => e.uid), [1, 2, 3, 4]);
  });

  it('filter by ownerOrMemberUid', async () => {
    const {
      events
    } = await service('identifier').search({
      ownerOrMemberUid: 1
    }, {}, {
      detailed: 1
    });

    assert.deepEqual(
      events.map(e => e.uid),
      [1, 2, 5]
    );
  });
});
