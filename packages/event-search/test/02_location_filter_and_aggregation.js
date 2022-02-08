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
    await service('location').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.location.json`)
      )
    })
  });

  it('all location info is provided if detailed option is specified', async () => {
    const { events } = await service('location').search({
    }, {}, { detailed: true });
    assert.deepEqual(
      _.uniq(events.filter(e => e.location).map(e => e.location.city)),
      ['Paris', 'Lille']
    )
  });

  it('city filter on "Paris"', async () => {
    const { events } = await service('location').search({
      city: 'Paris'
    }, {}, {detailed: true});

  assert.deepEqual(
    _.uniq(events.map(e => e.location.city)),
    ['Paris']
  )
  });

  it('adminLevel3 filter on "mel"', async () => {
    const { events } = await service('location').search({
      adminLevel3: 'mel'
    }, {}, {detailed: true});

    assert.deepEqual(
      _.uniq(events.map(e => e.location.adminLevel3)),
      ['mel']
    );
  });

  it('adminLevel3 search on "mel"', async () => {
    const { events } = await service('location').search({
      search: 'mel'
    }, {}, {detailed: true});

    assert.deepEqual(
      _.uniq(events.map(e => e.location.adminLevel3)),
      ['mel']
    );
  });

  it('adminLevel3 is a possible aggregation', async () => {
    const { aggregations } = await service('location').search({
      state: null
    }, {}, { detailed: true, aggregations: 'adminLevels3' });

    assert.deepEqual(aggregations.adminLevels3, [
      { key: 'test', eventCount: 3 },
      { key: 'mel', eventCount: 1 }
    ]);
  });

  it('adminLevel5 filter on "2eme"', async () => {
    const { events } = await service('location').search({
      adminLevel5: '2eme'
    }, {}, { detailed: true });

    assert.deepEqual(
      _.uniq(events.map(e => e.location.adminLevel5)),
      ['2eme']
    );
  });

  it('adminLevel5 search on "2eme"', async () => {
    const { events } = await service('location').search({
      search: '2eme'
    }, {}, {detailed: true});
    
    assert.deepEqual(
      _.uniq(events.map(e => e.location.adminLevel5)),
      ['2eme']
    );
  });

  it('adminLevel5 is a possible aggregation', async () => {
    const { aggregations } = await service('location').search({
      state: null
    }, {}, { detailed: true, aggregations: 'adminLevels5' });

    assert.deepEqual(aggregations.adminLevels5, [
      { key: '1er', eventCount: 1 },
      { key: '2eme', eventCount: 1 }
    ]);
  });

  it('missing option to count events without cities', async () => {
    const { aggregations } = await service('location').search({}, {}, {
      detailed: true,
      aggregations: [{
        key: 'littleFurryBunny',
        type: 'cities',
        missing: 'N/A'
      }]
    });

    assert.deepEqual(aggregations, {
      littleFurryBunny: [
        { key: 'Paris', eventCount: 3 },
        { key: 'Lille', eventCount: 1 },
        { key: 'N/A', eventCount: 1 }
      ]
    });
  });
});