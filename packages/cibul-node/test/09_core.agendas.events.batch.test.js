import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('09 - core - fuctional (server): core.agendas().events.batch()', () => {
  let core;
  const config = testConfig.extendWith({
    cachePrefix: 'c09_core_agendas_events_batch_test',
    queuesPrefix: 'q09:',
  });
  beforeAll(() => loadFixtures(config.db, '010.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
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
        'users',
        'keys',
      ],
    });

    core = Core(services, config);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(99501607).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('basic batch with core.agendas.events.list', () => {
    beforeAll(
      () =>
        new Promise((done) => {
          core.agendas(99501607).events.batch(
            'patch',
            {
              state: 0,
            },
            { state: 1 },
            {
              userUid: 1,
            },
          );

          core.tasks({
            active() {},
            error(...args) {
              done(args);
            },
            failed(...args) {
              done(args);
            },
            completed(...args) {
              if (args[0].name === 'batchedPatch') return done();
            },
          });
        }),
    );

    afterAll(async () => {
      await core.tasks.clear();
    });

    it('event is updated through batch operation', async () => {
      const event = await core.agendas(99501607).events.get(89898798);
      expect(event.state).toBe(1);
    });
  });

  describe('batch using core.agendas.events.search', () => {
    beforeAll(
      () =>
        new Promise((done) => {
          core.agendas(99501607).events.batch(
            'patch',
            {
              city: 'Arles',
              state: null,
            },
            { state: 2 },
            {
              userUid: 1,
              search: true,
            },
          );

          core.tasks({
            active() {},
            error(...args) {
              done(args);
            },
            failed(...args) {
              done(args);
            },
            completed(...args) {
              if (args[0].name === 'batchedPatch') return done();
            },
          });
        }),
    );

    afterAll(async () => {
      await core.tasks.clear();
    });

    it('event is updated through batch operation with search', async () => {
      const event = await core.agendas(99501607).events.get(20774404);
      expect(event.state).toBe(2);
    });
  });
});
