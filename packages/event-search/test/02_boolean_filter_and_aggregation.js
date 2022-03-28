'use strict';

const fs = require('fs');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

const fixtures = require('./fixtures/02_events.boolean.json');

describe('02 - event search - functional: boolean type', () => {
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
    await service('boolean').rebuild({
      eventsList: async (lastId, limit) => fixtures.list,
      formSchema: fixtures.formSchema
    });
  });

  it('filter on empty', async () => {
    const { events } = await service('boolean').search({
      trueOrFalse: 'null'
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert(events.length > 0);
    events.forEach(event => {
      assert.strictEqual(event.trueOrFalse, undefined);
    });
  });

  it('filter on true', async () => {
    const { events } = await service('boolean').search({
      trueOrFalse: true
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert(events.length > 0);

    events.forEach(event => {
      assert.strictEqual(event.trueOrFalse, true);
    });
  });

  it('filter on false', async () => {
    const { events } = await service('boolean').search({
      trueOrFalse: false
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true
    });

    assert(events.length > 0);

    events.forEach(event => {
      assert.strictEqual(event.trueOrFalse, false);
    });
  });

  it('aggregation on boolean field provides count for events including unset values count', async () => {
    const {
      aggregations
    } = await service('boolean').search({
      state: null
    }, { size: 0 }, {
      formSchema: fixtures.formSchema,
      detailed: true,
      aggregations: [{
        key: 'kayonashi',
        field: 'trueOrFalse',
        type: 'additionalFields',
        missing: 'N/A'
      }]
    });

    assert.deepEqual(aggregations.kayonashi, [{
      key: 'N/A',
      eventCount: 1
    }, {
      key: 'true',
      eventCount: 2
    }, {
      key: 'false',
      eventCount: 1
    }]);
  });
});