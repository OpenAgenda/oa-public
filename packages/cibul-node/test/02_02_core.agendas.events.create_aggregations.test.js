'use strict';

const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');
const eventFixtures = require('./fixtures/events');

const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create() - aggregations', () => {
  const memberUserUid = 63170200;

  let core;

  beforeAll(() => loadFixtures(testConfig.db, '003.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'tracker', // for testing
        'queues',
        'files',
        'events',
        'agendas',
        'agendaEvents',
        'aggregators',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'accessTokens'
      ]
    });

    core = Core(services, testConfig);

    services.aggregators.task();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('direct aggregation', () => {
    let event;

    beforeAll(() => {
      const promise = new Promise(rs => {
        core.services.tracker.on('aggregators.referenceEvent.done', rs, true);
      });

      core.agendas(17026855).events.create(eventFixtures[2], {
        context: {
          userUid: memberUserUid
        },
        access: 'contributor'
      }).then(e => { event = e; });

      return promise;
    });

    it('event was aggregated, taking default state', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      expect(ref.state).toBe(2);
    });

    it('sourcePaths is saved in agendaEvent ref', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      expect(ref.sourcePaths).toEqual([[17026855]]);
    });

    it('addMethod is aggregation', async () => {
      const ref = await core.agendas(55268170).events.get(event.uid);
      expect(ref.addMethod).toEqual('aggregation');
    });
  });

  describe('aggregation after add', () => {
    const context = {
      userUid: memberUserUid
    };
    let event;

    beforeAll(async () => {
      event = await core.agendas(58025176).events.create(eventFixtures[1], {
        context,
        access: 'contributor'
      });
    });

    beforeAll(() => {
      core.agendas(17026855).events.add(event.uid, {
        'thematiques-metropolitaines': 3,
        'categories-agenda-metropolitain': 42
      }, { context });

      return new Promise(rs => {
        core.services.tracker.on('aggregators.referenceEvent.done', rs, true);
      });
    });

    it('event is aggregated and source path starts at agenda where it was added', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      expect(ref.sourcePaths).toEqual([[17026855]]);
    });
  });
});
