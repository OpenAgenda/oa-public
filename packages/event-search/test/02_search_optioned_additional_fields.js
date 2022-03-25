'use strict';

const fs = require('fs');
const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

const fixtures = JSON.parse(
  fs.readFileSync(`${__dirname}/fixtures/02_events.optioned_additional.json`)
);

describe('02 - event search - functional: search in optioned additional fields', () => {
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
    await service('additional').rebuild({
      eventsList: async (lastId, limit) => fixtures.data,
      formSchema: fixtures.formSchema
    });
  });

  it('filters on additional field option', async () => {
    const { events } = await service('additional').search({
      'categories-agenda-metropolitain': 43
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0]['categories-agenda-metropolitain'], 43);
  });

  it('filters on multiple additional field values', async () => {
    const { events } = await service('additional').search({
      'categories-agenda-metropolitain': [43, 46]
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert.strictEqual(events.length, 2);
    assert.deepEqual(events.map(e => e.uid), [1, 2]);
  });

  it('filters on absence of value set for specific additional field', async () => {
    const { events } = await service('additional').search({
      state: 2,
      'categories-agenda-metropolitain': 'null'
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert.strictEqual(events.length, 1);
    assert.deepEqual(events[0]['categories-agenda-metropolitain'], undefined);
  });

  it('filters on absence of value AND existing value set for specific additional field', async () => {
    const { events } = await service('additional').search({
      state: 2,
      'categories-agenda-metropolitain': ['null', 43]
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert.strictEqual(events.length, 2);
    assert.deepEqual(events.map(e => e.uid), [2, 3]);
  });

  it('aggregation on additional field provides count for events with unspecified values', async () => {
    const { aggregations } = await service('additional').search({
      state: null
    }, { size: 0 }, {
      formSchema: fixtures.formSchema,
      detailed: true,
      aggregations: [{
        key: 'littleFurryBunny',
        field: 'categories-agenda-metropolitain',
        type: 'additionalFields',
        missing: 'N/A'
      }]
    });

    assert.deepEqual(aggregations, {
      littleFurryBunny: [
        {
          key: 'N/A',
          eventCount: 1
        },
        {
          id: 43,
          key: 43,
          value: 'atelier',
          label: {
            fr: 'Atelier'
          },
          eventCount: 1
        },
        {
          id: 46,
          key: 46,
          value: 'concert',
          label: {
            fr: 'Concert'
          },
          eventCount: 1
        }
      ]
    });
  });
});