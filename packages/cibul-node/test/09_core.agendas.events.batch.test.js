'use strict';

const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('09 - core - fuctional (server): core.agendas().events.batch()', () => {
  let core;
  const config = testConfig.extendWith({
    cachePrefix: 'c09_core_agendas_events_batch_test',
    queuesPrefix: 'q09:',
  });
  beforeAll(() => loadFixtures(config.db, '010.sql'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'queues',
        'bull',
        'files',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'aggregators',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
      ],
    });

    core = Core(services, config);

    await core.agendas(99501607).events.search.rebuild();
  });

  afterAll(async () => {
    core.services.knex.destroy();
    config.redisClient.quit();
  });

  describe('basic batch with core.agendas.events.list', () => {
    beforeAll(() => new Promise(done => {
      core.agendas(99501607).events.batch('patch', {
        state: 0,
      }, { state: 1 }, {
        userUid: 1,
      });

      core.tasks({
        execute() {},
        error(...args) { done(args); },
        success(...args) {
          if (args[0] === 'batchedPatch') return done();
        },
      });
    }));

    afterAll(async () => {
      await core.tasks.stop({ reset: true });
    });

    it('event is updated through batch operation', async () => {
      const event = await core.agendas(99501607).events.get(89898798);
      expect(event.state).toBe(1);
    });
  });

  describe('batch using core.agndas.events.search', () => {
    beforeAll(() => new Promise(done => {
      core.agendas(99501607).events.batch('patch', {
        city: 'Arles',
        state: null,
      }, { state: 2 }, {
        userUid: 1,
        search: true,
      });

      core.tasks({
        execute() {},
        error(...args) { done(args); },
        success(...args) {
          if (args[0] === 'batchedPatch') return done();
        },
      });
    }));

    afterAll(async () => {
      await core.tasks.stop({ reset: true });
    });

    it('event is updated through batch operation with search', async () => {
      const event = await core.agendas(99501607).events.get(20774404);
      expect(event.state).toBe(2);
    });
  });
});
