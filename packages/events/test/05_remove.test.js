'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');

describe('events - functional - remove', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client
    });
  });

  describe('simple remove', () => {
    let removed;

    beforeAll(async () => {
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

    beforeAll(async () => {
      await f.load();

      svc = Service({
        knex: f.client,
        interfaces: {
          beforeRemove: Object.assign(function(removed, context, cb) {
            setTimeout(() => {
              calls.push(['beforeRemove', removed, context]);
              cb();
            }, 100);
          }, {
            callback: true
          }),
          onRemove: async (removed, context) => {
            calls.push(['onRemove', removed, context]);
          }
        }
      });

      await svc.remove(93469090, { context: 'Remove context'});
    });

    it(
      'beforeRemove was called, when cb is provided in interface function it is called',
      () => {
        assert.equal(calls[0][0], 'beforeRemove');
      }
    );

    it('onRemove was called', () => {
      assert.equal(calls[1][0], 'onRemove');
    });
  });

  describe('other', () => {
    it('private event can be removed if private option is set', async () => {
      const removed = await svc.remove(51999554, { private: null });
    
      assert.equal(removed.uid, 51999554);
    })
  });
})
