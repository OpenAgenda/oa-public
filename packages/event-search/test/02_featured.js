'use strict';

const fs = require('fs');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: relative filter', () => {
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
    await service('featured').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.featured.json`)
      )
    })
  });

  it('default sort puts featured events first', async () => {
    const { events } = await service('featured').search();

    assert.equal(events[0].uid, 1);
  });

  it('featured filter to true limits results to filtered events', async () => {
    const { events } = await service('featured').search({
      featured: true
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].featured, true);
  });

  it('featured filter to false excludes featured events from results', async () => {
    const { events } = await service('featured').search({
      featured: false
    });

    assert.equal(events.length, 2);
    assert.equal(events[0].featured, false);
  });

});