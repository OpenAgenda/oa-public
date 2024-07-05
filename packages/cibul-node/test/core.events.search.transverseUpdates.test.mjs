import Core from '../core/index.mjs';
import Services from '../services/init.mjs';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.events.search', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '004.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
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
        'oembed',
        'legacy',
        'users',
        'keys',
        'accessTokens',
        'tracker',
      ],
    });

    core = Core(services, testConfig);

    await core.agendas(17026855).events.search.rebuild();
    await core.agendas(92983929).events.search.rebuild();
    await services.eventSearch.transverse.rebuild();

    services.eventSearch.task();
  });

  afterAll(() => {
    core.services.shutdown({ clear: true });
  });

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

      return new Promise(rs => {
        core.services.tracker.on('eventSearch.otherAgendasAndTransverseUpdate.done', rs, true);
      });
    });

    afterEach(() => {
      core.services.tracker.flush();
    });

    it('an update launches queues', async () => {
      const indexed = await core.events.search({ uid: 99999999 });

      console.log('indexed', indexed);
      expect(indexed.events[0].title.fr).toBe('test');
    });
  });
});
