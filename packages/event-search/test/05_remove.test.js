'use strict';

const fs = require('fs');
const config = require('../testconfig');
const Service = require('..');

describe('05 - event search - functional: remove', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    await service('05_remove').rebuild({
      eventsList: async (lastId, limit) =>
        JSON.parse(fs.readFileSync(`${__dirname}/fixtures/05_events.${lastId}.${limit}.json`)),

    });
  });

  it('remove an event from set by uid', async () => {
    const result = await service('05_remove').remove({
      uid: 1,
    }, { refresh: true });

    expect(result.success).toBe(true);
  });

  it('not found is thrown', async () => {
    let error;
    try {
      await service('05_remove').remove({
        uid: 2903,
      }, { refresh: true });
    } catch (e) {
      error = e;
    }

    expect(error.name).toBe('NotFound');
  });
});
