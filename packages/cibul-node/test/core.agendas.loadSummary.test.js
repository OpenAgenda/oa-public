import axios from 'axios';
import api from '../api/index.js';
import Core from '../core/index.js';
import Services from '../services/init.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core.agendas.loadSummary - Core and API tests', () => {
  let core;
  let server;
  let accessToken;
  let agendaKey;
  let userKey;

  const config = testConfig.extendWith({
    cachePrefix: 'core_agendas_loadSummary_test',
  });

  const baseUrl = 'http://localhost:4002';

  beforeAll(() => loadFixtures(config.db, '015.sql.js'));

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
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'oembed',
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

    await core.agendas(123).events.search.rebuild();
    await services.simpleCache.clearAll();
  });

  beforeAll(async () => {
    server = await api(core, { useRouter: false }).listen(4002);
  });

  beforeAll(async () => {
    // Get access token for authenticated requests
    accessToken = await axios({
      method: 'post',
      url: `${baseUrl}/requestAccessToken`,
      headers: {
        'content-type': 'application/json',
      },
      data: {
        code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
      },
    }).then((r) => r.data.access_token);

    // Get agenda key for some tests
    agendaKey = 'e830934e9d1848189ac74de3bfa7df0a'; // From fixtures

    // Get user key for personal key tests
    userKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9'; // From fixtures
  });

  afterAll(() => server.close());
  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core functionality', () => {
    it('basic', async () => {
      const summary = await core
        .agendas(123)
        .summary({ includes: ['publishedEvents'] });
      expect(summary).toBeTruthy();
    });

    it('should return basic summary without includes', async () => {
      const summary = await core.agendas(123).summary();
      expect(summary).toBeTruthy();
      expect(summary).toHaveProperty('keywords');
      expect(summary).toHaveProperty('publishedEvents');
      expect(summary).toHaveProperty('languages');
      expect(summary).toHaveProperty('recentlyAddedEvents');
      expect(summary).toHaveProperty('viewport');
      expect(summary).not.toHaveProperty('totals');
    });

    it('should return summary with enhanced publishedEvents when includes contains publishedEvents', async () => {
      const summary = await core
        .agendas(123)
        .summary({ includes: ['publishedEvents'] });
      expect(summary).toBeTruthy();
      expect(summary).toHaveProperty('publishedEvents');
      expect(summary.publishedEvents).toHaveProperty('events');
      expect(summary.publishedEvents).toHaveProperty('eventLocations');
      expect(summary.publishedEvents).toHaveProperty('eventCreators');
      expect(typeof summary.publishedEvents.events).toBe('number');
      expect(typeof summary.publishedEvents.eventLocations).toBe('number');
      expect(typeof summary.publishedEvents.eventCreators).toBe('number');
    });
  });

  describe('API functionality', () => {
    it('should return basic summary without includes parameter via API', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?key=${agendaKey}`,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toBeDefined();

      // Check basic summary structure
      expect(response.data.summary).toHaveProperty('keywords');
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary).toHaveProperty('languages');
      expect(response.data.summary).toHaveProperty('recentlyAddedEvents');
      expect(response.data.summary).toHaveProperty('viewport');

      // Should NOT have totals without includes parameter
      expect(response.data.summary).not.toHaveProperty('totals');
    });

    it('should return summary with enhanced publishedEvents when includes=publishedEvents via API (comma-separated)', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes=publishedEvents&key=${agendaKey}`,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toBeDefined();

      // Check that enhanced publishedEvents are included
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary.publishedEvents).toHaveProperty('events');
      expect(response.data.summary.publishedEvents).toHaveProperty(
        'eventLocations',
      );
      expect(response.data.summary.publishedEvents).toHaveProperty(
        'eventCreators',
      );

      // Verify enhanced publishedEvents are numbers
      expect(typeof response.data.summary.publishedEvents.events).toBe(
        'number',
      );
      expect(typeof response.data.summary.publishedEvents.eventLocations).toBe(
        'number',
      );
      expect(typeof response.data.summary.publishedEvents.eventCreators).toBe(
        'number',
      );
    });

    it('should return summary with enhanced publishedEvents when includes[]=publishedEvents via API (array format)', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes[]=publishedEvents&key=${agendaKey}`,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toBeDefined();

      // Check that enhanced publishedEvents are included
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary.publishedEvents).toHaveProperty('events');
      expect(response.data.summary.publishedEvents).toHaveProperty(
        'eventLocations',
      );
      expect(response.data.summary.publishedEvents).toHaveProperty(
        'eventCreators',
      );

      // Verify enhanced publishedEvents are numbers
      expect(typeof response.data.summary.publishedEvents.events).toBe(
        'number',
      );
      expect(typeof response.data.summary.publishedEvents.eventLocations).toBe(
        'number',
      );
      expect(typeof response.data.summary.publishedEvents.eventCreators).toBe(
        'number',
      );
    });

    it('should work with access token authentication', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes=publishedEvents`,
        headers: {
          'access-token': accessToken,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary.publishedEvents).toHaveProperty('events');
    });

    it('should require authentication when no key provided', async () => {
      const { error } = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary`,
      }).then(
        (r) => ({ response: r }),
        (e) => ({ error: e }),
      );

      expect(error.response.status).toBe(403);
    });

    it('should handle invalid agenda UID', async () => {
      const { error } = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/99999/summary?key=${agendaKey}`,
      }).then(
        (r) => ({ response: r }),
        (e) => ({ error: e }),
      );

      expect(error.response.status).toBe(404);
    });

    it('should handle multiple includes parameters (comma-separated)', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes=publishedEvents,other&key=${agendaKey}`,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary.publishedEvents).toHaveProperty('events');
    });

    it('should handle multiple includes parameters (array format)', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes[]=publishedEvents&includes[]=other&key=${agendaKey}`,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary.publishedEvents).toHaveProperty('events');
    });

    it('should work with empty includes parameter', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes=&key=${agendaKey}`,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).not.toHaveProperty('totals');
    });

    it('should work with personal user key authentication', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes=publishedEvents&key=${userKey}`,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toBeDefined();
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary.publishedEvents).toHaveProperty('events');
      expect(response.data.summary.publishedEvents).toHaveProperty(
        'eventLocations',
      );
      expect(response.data.summary.publishedEvents).toHaveProperty(
        'eventCreators',
      );
    });

    it('should work with personal user key in headers', async () => {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/agendas/123/summary?includes=publishedEvents`,
        headers: {
          key: userKey,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.summary).toBeDefined();
      expect(response.data.summary).toHaveProperty('publishedEvents');
      expect(response.data.summary.publishedEvents).toHaveProperty('events');
    });
  });
});
