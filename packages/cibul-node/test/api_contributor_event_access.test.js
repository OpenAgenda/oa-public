import ky from 'ky';
import Core from '../core/index.js';
import api from '../api/index.js';
import Services from '../services/init.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('api: contributor access to their own events based on state', () => {
  let core;
  let server;
  let accessToken;
  let otherContributorToken;

  const config = testConfig.extendWith({
    cachePrefix: 'c15_api_contributor_access_test',
  });

  beforeAll(() => loadFixtures(config.db, '025.sql.js'));

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
        'members',
        'networks',
        'users',
        'keys',
      ],
    });

    core = Core(services, config);

    await services.formSchemas.clearCache();

    // Delete and rebuild search index - only agenda 1 (with state: 2) will be indexed
    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(1).events.search.rebuild();
    await core.agendas(3).events.search.rebuild();
  });

  beforeAll(async () => {
    server = await api(core, { useRouter: false }).listen(4001);
  });

  beforeAll(async () => {
    // Request access token for user 1 (creator)
    const creatorTokenResponse = await ky
      .post('http://localhost:4001/requestAccessToken', {
        json: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      })
      .json();
    accessToken = creatorTokenResponse.access_token;

    // Request access token for user 2 (other contributor, not creator)
    const otherTokenResponse = await ky
      .post('http://localhost:4001/requestAccessToken', {
        json: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhN',
        },
      })
      .json();
    otherContributorToken = otherTokenResponse.access_token;
  });

  afterAll(() => server.close());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('Bug demonstration: contributor access based on event state', () => {
    it('state filter is cleaned for contrib', async () => {
      const response = await ky.get('http://localhost:4001/agendas/3/events', {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        searchParams: {
          state: [0, 1, 2],
        },
      });

      expect(response.status).toBe(200);
      const responseData = await response.json();
      const unpublishedEvent = responseData.events.find((e) => e.state !== 2);
      expect(unpublishedEvent).toBeUndefined();
    });

    it('state filter is not cleaned if member filter is seet and the same has acting member', async () => {
      const response = await ky.get('http://localhost:4001/agendas/3/events', {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        searchParams: {
          state: [0, 1, 2],
          memberUid: 1,
        },
      });

      expect(response.status).toBe(200);
      const responseData = await response.json();
      const unpublishedEvent = responseData.events.filter((e) => e.state !== 2);
      expect(unpublishedEvent.length).toBeTruthy();
    });

    it('state filter is clean if member filter is set but not the same as acting member', async () => {
      const response = await ky.get('http://localhost:4001/agendas/3/events', {
        headers: {
          authorization: `Bearer ${otherContributorToken}`,
        },
        searchParams: {
          state: [0, 1, 2],
          memberUid: 1,
        },
      });

      expect(response.status).toBe(200);
      const responseData = await response.json();
      const unpublishedEvent = responseData.events.find((e) => e.state !== 2);
      expect(unpublishedEvent).toBeUndefined();
    });
  });
});
