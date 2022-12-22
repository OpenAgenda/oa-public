'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: location', () => {
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
    await service('synthaxic').rebuild({
      eventsList: async (_lastId, _limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.synthaxic.json`),
      ),
    });
  });

  it('Expo shows Exposition too', async () => {
    const { events } = await service('synthaxic').search({
      search: 'Expo',
    }, {}, { detailed: true });

    expect(
      events.filter(e => e.title.fr.indexOf('exposition') !== -1).length,
    ).toBe(1);
  });
});
