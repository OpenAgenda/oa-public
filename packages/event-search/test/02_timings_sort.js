'use strict';

const fs = require('fs');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: timings sorting', () => {
  let service;

  before(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  before(() => service('timings').rebuild({
    eventsList: async (lastId, limit) => JSON.parse(fs.readFileSync(`${__dirname}/fixtures/02_events.timings.json`))
  }));

  it('by default sorts from the nearest to the furthest in the future', async () => {
    const { events } = await service('timings').search({});

    assert.deepEqual(
      events.map(e => e.title.fr),
      ['Tic', 'Tac', 'Rangers du risque']
    );
  });

  it('filtered on specific upcoming period focuses search on the filtered period', async () => {
    const { events } = await service('timings').search({
      timings: {
        gte: new Date('2030-01-02T00:00:00+0200')
      }
    });

    assert.deepEqual(
      events.map(e => e.title.fr), 
      ['Rangers du risque', 'Tac', 'Tic']
    );
  });

  it('sorts using begin of timing, filters out on accessible_until (end)', async () => {
    const { events } = await service('timings').search({
      state: 1,
      timings: {
        gte: new Date('2042-06-11T00:00:00+0200')
      }
    });

    assert.deepEqual(
      events.map(e => e.title.fr),
      ['Visite guidée le Vieux Lille', 'Mon dodo']
    );
  });

  it('sort using lastTimingWithFeatured', async () => {
    const { events } = await service('timings').search({
      state: null,
      sort: 'lastTimingWithFeatured.asc'
    });

    const { isSorted } = events.reduce(({ isSorted, previous }, event) => {
      if (!isSorted) {
        return { isSorted };
      };

      return {
        isSorted: previous ? event.lastTiming.begin > previous.lastTiming.begin : true,
        previous: event
      };
    }, {
      isSorted: true,
      previous: null
    });

    assert(isSorted);
  });
});