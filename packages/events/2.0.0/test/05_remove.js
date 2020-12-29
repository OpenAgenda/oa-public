'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');

describe('events - functional - remove', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql, config.schema);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client
    });
  });

  describe('simple remove', () => {
    let removed;

    before(async () => {
      removed = await svc.remove(16687899);
    });

    it('response is removed event', () => {
      assert.equal(removed.uid, 16687899);
    });

    it('remove is a soft delete', async () => {
      const deletedAt = await f.client('event_2')
        .first(['deleted_at'])
        .where('uid', removed.uid)
        .then(r => r.deleted_at);

      assert(deletedAt instanceof Date);
    });

  });

  describe('interfaces', () => {
    const calls = [];

    before(async () => {
      await f.load();

      svc = Service({
        knex: f.client,
        interfaces: {
          beforeRemove: async (removed, context) => {
            calls.push(['beforeRemove', removed, context]);
          },
          onRemove: async (removed, context) => {
            calls.push(['onRemove', removed, context]);
          }
        }
      });

      await svc.remove(93469090, { context: 'Remove context'});
    });

    it('beforeRemove was called', () => {
      assert.equal(calls[0][0], 'beforeRemove');
    });

    it('onRemove was called', () => {
      assert.equal(calls[1][0], 'onRemove');
    });
  });
})
