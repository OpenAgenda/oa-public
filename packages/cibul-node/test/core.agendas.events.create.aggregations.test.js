import Core from '../core/index.js';
import Services from '../services/init.js';
import eventFixtures from './fixtures/events/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.agendas().events.create() - aggregations', () => {
  const memberUserUid = 63170200;

  let core;

  const config = testConfig.extendWith({
    cachePrefix: 'core_agendas_events_create_aggregation_tests',
    queuesPrefix: 'createaggrtst:',
  });

  beforeAll(() => loadFixtures(config.db, '003.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'tracker', // for testing
        'bull',
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
        'users',
        'keys',
        'accessTokens',
      ],
    });

    core = Core(services, config);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    services.aggregators.task();

    await core.agendas(55268170).events.search.rebuild();
    await core.agendas(17026800).events.search.rebuild();
  });

  beforeAll(() => {
    core.services.tracker.flush();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('direct aggregation', () => {
    let event;

    beforeAll(() => {
      core
        .agendas(17026855)
        .events.create(eventFixtures[2], {
          context: {
            userUid: memberUserUid,
          },
          access: 'contributor',
        })
        .then((e) => {
          event = e;
        });

      return new Promise((rs) => {
        core.services.tracker.on('aggregators.referenceEvent.done', rs, true);
      });
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

    it('sourceAgendas are indexed in event document of aggregator', async () => {
      const { events } = await core
        .agendas(55268170)
        .events.search({ uid: event.uid }, {}, { detailed: true });

      expect(events[0].sourceAgendas.length).toBe(1);
    });

    describe('update of aggregated event', () => {
      let updated;
      beforeAll(async () => {
        updated = await core.agendas(55268170).events.patch(
          event.uid,
          {
            featured: 1,
          },
          {
            detailed: true,
            userUid: 1,
          },
        );
      });

      it('update does not remove source information in indexed document', async () => {
        const { events } = await core
          .agendas(55268170)
          .events.search({ uid: event.uid }, {}, { detailed: true });

        expect(events[0].sourceAgendas.length).toBe(1);
      });

      it('update does not clear aggregated reference', async () => {
        expect(updated.aggregated).toHaveLength(32);
      });
    });
  });

  describe('aggregation after add', () => {
    const context = {
      userUid: memberUserUid,
    };
    let event;

    beforeAll(async () => {
      event = await core.agendas(58025176).events.create(eventFixtures[1], {
        context,
        access: 'contributor',
      });
    });

    beforeAll(() => {
      core.agendas(17026855).events.add(
        event.uid,
        {
          'thematiques-metropolitaines': 3,
          'categories-agenda-metropolitain': 42,
        },
        { context },
      );

      return new Promise((rs) => {
        core.services.tracker.on('aggregators.referenceEvent.done', rs, true);
      });
    });

    it('event is aggregated and source path starts at agenda where it was added', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      expect(ref.sourcePaths).toEqual([[17026855]]);
    });
  });

  describe('aggregation values update through rules', () => {
    let event;
    const context = {
      userUid: memberUserUid,
    };

    beforeAll(async () => {
      event = await core.agendas(17026800).events.create(eventFixtures[2], {
        context,
        access: 'contributor',
      });

      await new Promise((rs) => {
        core.services.tracker.on('aggregators.referenceEvent.done', rs);
      });

      // first aggregation happened
      core.agendas(17026800).events.patch(
        event.uid,
        {
          'categories-agenda-metropolitain': 43,
        },
        {
          context,
        },
      );

      return new Promise((rs) => {
        core.services.tracker.on(
          'aggregators.updateEventReference.done',
          rs,
          true,
        );
      });
    });

    it('update of event at source triggered update of impacted value in aggregator', async () => {
      const ref = await core.agendas(55278973).events.get(event.uid);
      expect(ref['categories-agenda-metropolitain']).toBe(43);
    });
  });

  describe('list sources', () => {
    it('lists sources of an agenda', async () => {
      const { after, sources } = await core
        .agendas(55268170)
        .sources.list({}, { size: 20, after: null }, { detailed: true });
      expect(sources.length).toBe(1);
      expect(after).toBeNull();
    });
  });

  describe('create source', () => {
    it('adds a new source to an agenda', async () => {
      await core.agendas(55268170).sources.create(58025176, []);

      const { sources } = await core
        .agendas(55268170)
        .sources.list({}, { size: 20, after: null }, { detailed: true });

      expect(sources.length).toBe(2);
      expect(sources.some((s) => s.agenda.uid === 58025176)).toBe(true);
    });
  });
});
