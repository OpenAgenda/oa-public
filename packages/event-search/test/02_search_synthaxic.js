'use strict';

const fs = require('fs');
const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: location', () => {
  let service;

  before(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  before(async () => {
    await service('synthaxic').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.synthaxic.json`)
      )
    })
  });

  it('Expo shows Exposition too', async () => {
    const { events } = await service('synthaxic').search({
      search: 'Expo'
    }, {}, { detailed: true });

    assert.strictEqual(
      events.filter(e => e.title.fr.indexOf('exposition') !== -1).length,
      1
    );
  });
});