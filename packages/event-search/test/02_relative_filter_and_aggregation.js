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
    await service('relative').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.relative.json`)
      )
    })
  });

  it('relative filter set to passed only returns passed events', async () => {
    const { events, total } = await service('relative').search({
      relative: 'passed'
    });

    assert.equal(total, 1);
    assert.equal(events[0].title.fr, 'Marignan');
  });

  it('relative filter set to upcoming returns upcoming events', async () => {
    const { events, total } = await service('relative').search({
      relative: 'upcoming'
    });

    assert.equal(total, 1);
    assert.equal(events[0].title.fr, 'Amarsissage de Musk');
  });

  it('relative filter set to current returns events with both passed and upcoming timings', async () => {
    const { events, total } = await service('relative').search({
      relative: 'current'
    });

    assert.equal(total, 1);
    assert.equal(events[0].title.fr, 'Eclipses lunaires');
  });

  it('aggregation', async () => {
    const {
      aggregations
    } = await service('relative').search({}, { size: 0 }, { aggregations: 'relative' });

    assert.deepEqual(
      aggregations.relative,
      [{
        key: 'current',
        eventCount: 1
      }, {
        key: 'passed',
        eventCount: 1
      }, {
        key: 'upcoming',
        eventCount: 1
      }]
    );
  });

  it('relative filter set to current and upcoming returns current and upcoming', async () => {
    const { events } = await service('relative').search({
      relative: ['current', 'upcoming']
    });

    assert.deepEqual(
      events.map(e => e.title.fr),
      ['Eclipses lunaires', 'Amarsissage de Musk']
    );
  });

  it('relative filter set to passed and current returns passed and current', async () => {
    const { events } = await service('relative').search({
      relative: ['current', 'passed']
    });

    assert.deepEqual(
      events.map(e => e.title.fr),
      ['Eclipses lunaires', 'Marignan']
    );
  });

  it('relative filter set to passed and upcoming excludes current', async () => {
    const { events } = await service('relative').search({
      relative: ['passed', 'upcoming']
    });

    assert.deepEqual(
      events.map(e => e.title.fr),
      ['Amarsissage de Musk', 'Marignan']
    );
  });

});