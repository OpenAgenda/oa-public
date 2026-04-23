import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'simpleCache',
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
];

describe('services - functional (server): core agendas() events.clearOldSoftRemoved()', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['022.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(17026855).events.search.rebuild();
    await core.agendas(17026800).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('basic', () => {
    let searchResultBefore;

    beforeAll(async () => {
      searchResultBefore = await core
        .agendas(17026855)
        .events.search({}, {}, { removed: true, access: 'administrator' });
    });

    it('should clear old soft removed events', async () => {
      await core.services.agendaEvents.clearOldSoftRemoved();
      const searchResultAfter = await core
        .agendas(17026855)
        .events.search({}, {}, { removed: true, access: 'administrator' });

      expect(searchResultBefore.total).toBe(2);
      expect(searchResultAfter.total).toBe(0);
    });
  });
});
