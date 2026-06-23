import ky from 'ky';
import Core from '../core/index.js';
import Services from '../services/init.js';
import api from '../api/index.js';
import startTestServer from './helpers/startTestServer.js';
import eventFixtures from './fixtures/events/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
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
  'accessTokens',
];

describe('core - functional (server): core.agendas().events.removeByExtId()', () => {
  let core;
  const memberUserUid = 63170200;

  const config = testConfig.extendWith({
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test-events-removebyextid',
    },
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['003.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    services.aggregators.task();

    await core.agendas(17026855).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('basic', () => {
    let event;

    beforeAll(async () => {
      event = await core.agendas(17026855).events.create(
        {
          ...eventFixtures[2],
          extIds: [
            { key: 'test', value: 'QSJJSDD' },
            { key: 'test2', value: 'test' },
          ],
        },
        {
          context: {
            userUid: memberUserUid,
          },
          access: 'contributor',
        },
      );
    });

    it('if event exists, remove it', async () => {
      let err = null;
      const resp = await core
        .agendas(17026855)
        .events.removeByExtId('test', 'QSJJSDD', {
          context: { userUid: memberUserUid },
        });
      try {
        await core
          .agendas(17026855)
          .events.search.get({ uid: event.uid }, { userUid: memberUserUid });
      } catch (e) {
        err = e;
      }
      expect(err.message).toBe('event not found');
      expect(resp.uid).toBe(event.uid);
    });
  });

  describe('api', () => {
    const secret = 'STt5KTzxPJHUG6N0ty3poxN896UseQhM';
    let server;
    let baseUrl;
    let accessToken;
    let response;
    let event;

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
            code: secret,
          },
        })
        .json();
      accessToken = tokenResponse.access_token;

      event = await core.agendas(17026855).events.create(
        { ...eventFixtures[2], extIds: [{ key: 'test', value: 'thing' }] },
        {
          context: {
            userUid: memberUserUid,
          },
          access: 'contributor',
        },
      );
    });

    it('removed', async () => {
      let err = null;
      response = await ky
        .delete(`${baseUrl}/agendas/17026855/events/ext/test/thing`, {
          headers: {
            'access-token': accessToken,
          },
        })
        .json()
        .catch((e) => console.log(e));
      try {
        await core
          .agendas(17026855)
          .events.search.get(
            { extId: { key: 'test', value: 'thing' } },
            { userUid: memberUserUid },
          );
      } catch (e) {
        err = e;
      }
      expect(err.message).toBe('event not found');
      expect(response.event.uid).toBe(event.uid);
      expect(response.event.extIds).toStrictEqual([
        { key: 'test', value: 'thing' },
      ]);
    });
  });
});
