'use strict';

const fs = require('fs');
const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

const fixtures = JSON.parse(
  fs.readFileSync(`${__dirname}/fixtures/02_events.optioned_additional.json`)
);

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

  it('filters on absence of value set for specific additional field', async () => {
    const { events } = await service('additional').search({
      'categories-agenda-metropolitain': 'null'
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert.strictEqual(events.length, 1);
    assert.deepEqual(events[0]['categories-agenda-metropolitain'], []);
  });
});