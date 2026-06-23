import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import startTestServer from './helpers/startTestServer.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
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
  'accessTokens',
  'tracker',
];

describe('core - functional (server): core agendas() events.remove()', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['006.sql.js'],
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

    await core.agendas(17026800).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('remove from other agenda', () => {
    let event;
    let searchResultBefore;

    beforeAll(async () => {
      searchResultBefore = await core
        .agendas(17026800)
        .events.search({ uid: 19201989 });
    });

    beforeAll(async () => {
      event = await core
        .agendas(17026800)
        .events.remove(19201989, { access: 'internal' });
    });

    it('result is removed event', () => {
      expect(event.uid).toBe(19201989);
    });

    it('event is removed from agenda search', async () => {
      const { total } = await core
        .agendas(17026800)
        .events.search({ uid: 19201989 });
      expect(searchResultBefore.total).toBe(1);
      expect(total).toBe(0);
    });
  });

  describe('remove from origin agenda', () => {
    let event;

    beforeAll(async () => {
      event = await core
        .agendas(17026855)
        .events.remove(19201978, { access: 'internal' });
    });

    it('result is removed event', () => {
      expect(event.uid).toBe(19201978);
    });
  });

  describe('remove draft event', () => {
    let eventBefore;
    let eventAfter;

    beforeAll(async () => {
      eventBefore = await core.agendas(17026855).events.get(89378913);
    });

    beforeAll(async () => {
      await core
        .agendas(17026855)
        .events.remove(89378913, { access: 'internal' });
    });

    beforeAll(async () => {
      eventAfter = await core.agendas(17026855).events.get(89378913);
    });

    it('draft event is removed', () => {
      expect(eventBefore.uid).toBe(89378913);
      expect(eventAfter).toBeNull();
    });
  });

  describe('errors', () => {
    it('remove non-existing event throws NotFound exception', async () => {
      let error;
      try {
        await core.agendas(17026855).events.remove(99999999);
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('NotFound');
    });
  });

  describe('api', () => {
    let server;
    let baseUrl;
    let accessToken;
    let response;

    beforeAll(async () => {
      ({ server, baseUrl } = await startTestServer(
        api(core, { useRouter: false }),
      ));
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const tokenResponse = await ky
        .post(`${baseUrl}/requestAccessToken`, {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    beforeAll(async () => {
      response = await ky
        .delete(`${baseUrl}/agendas/17026855/events/90298390`, {
          headers: {
            'access-token': accessToken,
          },
        })
        .json();
    });

    it('response gives success key at true if creation was a success', () => {
      expect(response.success).toBe(true);
    });

    it('response provides the deleted event', () => {
      expect(response.event.uid).toBe(90298390);
    });

    it('deleting non-existant event returns 404', async () => {
      const errorResponse = await ky
        .delete(`${baseUrl}/agendas/17026855/events/90298390`, {
          headers: {
            'access-token': accessToken,
          },
        })
        .json()
        .then(
          () => {},
          (err) => err.response,
        );

      expect(errorResponse.status).toBe(404);
    });

    it('user with no relevent authorization cannot delete event', async () => {
      const tokenResponse = await ky
        .post(`${baseUrl}/requestAccessToken`, {
          json: {
            code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
          },
        })
        .json();
      const anotherAccessToken = tokenResponse.access_token;

      const { error, result } = await ky
        .delete(`${baseUrl}/agendas/17026855/events/789456`, {
          headers: {
            'access-token': anotherAccessToken,
          },
        })
        .json()
        .then(
          (r) => ({ result: r }),
          (e) => ({ error: e }),
        );

      expect(result).toBeUndefined();
      expect(error.response.status).toBe(403);
    });
  });
});
