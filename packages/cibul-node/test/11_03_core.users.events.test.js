import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('11 - core - functional (server): core.users().agendas.events', () => {
  let core;

  const config = testConfig.extendWith({
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test-users-events',
    },
  });

  beforeAll(() => loadFixtures(config.db, '017.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'bull',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'agendaSearch',
        'members',
        'networks',
        'users',
        'keys',
        'trackers',
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
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('drafts', () => {
    it('list drafts saved by user in agenda', async () => {
      const result = await core
        .users(63170203)
        .agendas(17026855)
        .events.drafts();
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].draft).toBe(1);
    });
  });

  describe('events', () => {
    it('list events owned by user in agenda', async () => {
      const result = await core
        .users(63170203)
        .agendas(17026855)
        .events.search();

      expect(result.total).toBe(2);
      expect(result.events.map(({ uid }) => uid)).toEqual([19201989, 19390293]);
    });

    it('list events owned or contributed by user in agenda', async () => {
      const result = await core
        .users(63170203)
        .agendas(17026855)
        .events.search(
          {
            relation: ['owned', 'contributed'],
          },
          {},
        );

      expect(result.total).toBe(3);
      expect(result.events.map(({ uid }) => uid)).toEqual([
        19201989, 19390293, 99999999,
      ]);
    });
  });
});
