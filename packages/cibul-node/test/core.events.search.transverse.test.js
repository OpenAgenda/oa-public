import Core from '../core/index.js';
import Services from '../services/init.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.events.search', () => {
  let core;

  const config = testConfig.extendWith({
    queuesPrefix: 'trsvrsupdtest:',
  });

  beforeAll(() => loadFixtures(config.db, '004.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
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
        'oembed',
        'users',
        'keys',
        'accessTokens',
        'tracker',
      ],
    });

    core = Core(services, config);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(17026855).events.search.rebuild();
    await core.agendas(92983929).events.search.rebuild();
    await core.agendas(99508978).events.search.rebuild();
    await services.eventSearch.transverse.rebuild();

    services.eventSearch.task();
  });

  beforeAll(() => {
    core.services.tracker.flush();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('patching', () => {
    beforeAll(async () => {
      core.agendas(17026855).events.patch(
        99999999,
        {
          title: {
            fr: 'test',
          },
        },
        {
          access: 'administrator',
          detailed: true,
        },
      );

      return new Promise((rs) => {
        core.services.tracker.on('transverseIndex.done', rs, true);
      });
    });

    it('an update launches queues', async () => {
      const indexed = await core.events.search({ uid: 99999999 });

      expect(indexed.events[0].title.fr).toBe('test');
    });
  });

  describe('searching', () => {
    let privateEvent;

    beforeAll(async () => {
      const { events } = await core.events.search({ uid: 897978987 });

      [privateEvent] = events;

      core
        .agendas(99508978)
        .events.patch(
          897978987,
          { description: { fr: 'caché' } },
          { access: 'administrator', detailed: true, private: null },
        );

      return new Promise((rs) => {
        core.services.tracker.on(
          'eventSearch.update:99508978.897978987:noTransverse',
          rs,
          true,
        );
      });
    });

    it('private events are not indexed after rebuild', () => {
      expect(privateEvent).toBeUndefined();
    });

    it('private events are not indexed', async () => {
      expect(
        await core.events.search({ uid: 897978987 }).then(({ total }) => total),
      ).toBe(0);
    });
  });
});
