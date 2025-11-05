import ky from 'ky';
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
    const tokenResponse = await ky
      .post(`${baseUrl}/requestAccessToken`, {
        json: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      })
      .json();
    accessToken = tokenResponse.access_token;

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
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?key=${agendaKey}`,
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toBeDefined();

      // Check basic summary structure
      expect(responseData.summary).toHaveProperty('keywords');
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary).toHaveProperty('languages');
      expect(responseData.summary).toHaveProperty('recentlyAddedEvents');
      expect(responseData.summary).toHaveProperty('viewport');

      // Should NOT have totals without includes parameter
      expect(responseData.summary).not.toHaveProperty('totals');
    });

    it('should return summary with enhanced publishedEvents when includes=publishedEvents via API (comma-separated)', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes=publishedEvents&key=${agendaKey}`,
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toBeDefined();

      // Check that enhanced publishedEvents are included
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary.publishedEvents).toHaveProperty('events');
      expect(responseData.summary.publishedEvents).toHaveProperty(
        'eventLocations',
      );
      expect(responseData.summary.publishedEvents).toHaveProperty(
        'eventCreators',
      );

      // Verify enhanced publishedEvents are numbers
      expect(typeof responseData.summary.publishedEvents.events).toBe('number');
      expect(typeof responseData.summary.publishedEvents.eventLocations).toBe(
        'number',
      );
      expect(typeof responseData.summary.publishedEvents.eventCreators).toBe(
        'number',
      );
    });

    it('should return summary with enhanced publishedEvents when includes[]=publishedEvents via API (array format)', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes[]=publishedEvents&key=${agendaKey}`,
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toBeDefined();

      // Check that enhanced publishedEvents are included
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary.publishedEvents).toHaveProperty('events');
      expect(responseData.summary.publishedEvents).toHaveProperty(
        'eventLocations',
      );
      expect(responseData.summary.publishedEvents).toHaveProperty(
        'eventCreators',
      );

      // Verify enhanced publishedEvents are numbers
      expect(typeof responseData.summary.publishedEvents.events).toBe('number');
      expect(typeof responseData.summary.publishedEvents.eventLocations).toBe(
        'number',
      );
      expect(typeof responseData.summary.publishedEvents.eventCreators).toBe(
        'number',
      );
    });

    it('should work with access token authentication', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes=publishedEvents`,
        {
          headers: {
            'access-token': accessToken,
          },
        },
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary.publishedEvents).toHaveProperty('events');
    });

    it('should require authentication when no key provided', async () => {
      const error = await ky
        .get(`${baseUrl}/agendas/123/summary`)
        .json()
        .then(
          () => {},
          (err) => err,
        );

      expect(error.response.status).toBe(403);
    });

    it('should handle invalid agenda UID', async () => {
      const error = await ky
        .get(`${baseUrl}/agendas/99999/summary?key=${agendaKey}`)
        .json()
        .then(
          () => {},
          (err) => err,
        );

      expect(error.response.status).toBe(404);
    });

    it('should handle multiple includes parameters (comma-separated)', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes=publishedEvents,other&key=${agendaKey}`,
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary.publishedEvents).toHaveProperty('events');
    });

    it('should handle multiple includes parameters (array format)', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes[]=publishedEvents&includes[]=other&key=${agendaKey}`,
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary.publishedEvents).toHaveProperty('events');
    });

    it('should work with empty includes parameter', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes=&key=${agendaKey}`,
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).not.toHaveProperty('totals');
    });

    it('should work with personal user key authentication', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes=publishedEvents&key=${userKey}`,
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toBeDefined();
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary.publishedEvents).toHaveProperty('events');
      expect(responseData.summary.publishedEvents).toHaveProperty(
        'eventLocations',
      );
      expect(responseData.summary.publishedEvents).toHaveProperty(
        'eventCreators',
      );
    });

    it('should work with personal user key in headers', async () => {
      const response = await ky.get(
        `${baseUrl}/agendas/123/summary?includes=publishedEvents`,
        {
          headers: {
            key: userKey,
          },
        },
      );
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.summary).toBeDefined();
      expect(responseData.summary).toHaveProperty('publishedEvents');
      expect(responseData.summary.publishedEvents).toHaveProperty('events');
    });
  });
});
