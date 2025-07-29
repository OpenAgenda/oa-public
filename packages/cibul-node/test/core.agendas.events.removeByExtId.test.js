import axios from 'axios';
import Core from '../core/index.js';
import Services from '../services/init.js';
import api from '../api/index.js';
import eventFixtures from './fixtures/events/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.agendas().events.removeByExtId()', () => {
  let core;
  const memberUserUid = 63170200;

  beforeAll(() => loadFixtures(testConfig.db, '003.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'tracker', // for testing
        'queues',
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
        'accessTokens',
      ],
    });

    core = Core(services, testConfig);

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
    let accessToken;
    let response;
    let event;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:4000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: secret,
        },
      }).then((r) => r.data.access_token);

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
      response = await axios({
        method: 'delete',
        url: 'http://localhost:4000/agendas/17026855/events/ext/test/thing',
        headers: {
          'access-token': accessToken,
          'content-type': 'application/json',
        },
      })
        .then((r) => r.data)
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
