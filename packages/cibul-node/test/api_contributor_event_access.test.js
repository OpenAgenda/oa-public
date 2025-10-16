import axios from 'axios';
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
    accessToken = await axios({
      method: 'post',
      url: 'http://localhost:4001/requestAccessToken',
      headers: {
        'content-type': 'application/json',
      },
      data: {
        code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
      },
    }).then((r) => r.data.access_token);

    // Request access token for user 2 (other contributor, not creator)
    otherContributorToken = await axios({
      method: 'post',
      url: 'http://localhost:4001/requestAccessToken',
      headers: {
        'content-type': 'application/json',
      },
      data: {
        code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhN',
      },
    }).then((r) => r.data.access_token);
  });

  afterAll(() => server.close());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('Bug demonstration: contributor access based on event state', () => {
    it('state filter is cleaned for contrib', async () => {
      const response = await axios({
        method: 'get',
        url: 'http://localhost:4001/agendas/3/events',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        params: {
          state: [0, 1, 2],
        },
      });

      expect(response.status).toBe(200);
      const unpublishedEvent = response.data.events.find((e) => e.state !== 2);
      expect(unpublishedEvent).toBeUndefined();
    });

    it('state filter is not cleaned if member filter is seet and the same has acting member', async () => {
      const response = await axios({
        method: 'get',
        url: 'http://localhost:4001/agendas/3/events',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        params: {
          state: [0, 1, 2],
          memberUid: 1,
        },
      });

      expect(response.status).toBe(200);
      const unpublishedEvent = response.data.events.filter(
        (e) => e.state !== 2,
      );
      expect(unpublishedEvent.length).toBeTruthy();
    });

    it('state filter is clean if member filter is set but not the same as acting member', async () => {
      const response = await axios({
        method: 'get',
        url: 'http://localhost:4001/agendas/3/events',
        headers: {
          authorization: `Bearer ${otherContributorToken}`,
        },
        params: {
          state: [0, 1, 2],
          memberUid: 1,
        },
      });

      expect(response.status).toBe(200);
      const unpublishedEvent = response.data.events.find((e) => e.state !== 2);
      expect(unpublishedEvent).toBeUndefined();
    });
  });
});
