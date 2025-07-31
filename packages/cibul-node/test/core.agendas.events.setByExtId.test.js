import axios from 'axios';
import Core from '../core/index.js';
import Services from '../services/init.js';
import api from '../api/index.js';
import eventFixtures from './fixtures/events/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.agendas().events.setByExtId()', () => {
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
        'bull',
        'files',
        'events',
        'agendas',
        'agendaEvents',
        'aggregators',
        'agendaLocations',
        'registrations',
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

    it('if event exists, update it', async () => {
      const updatedEvent = await core
        .agendas(17026855)
        .events.setByExtId(
          'test',
          'QSJJSDD',
          { ...eventFixtures[2], extIds: [{ key: 'test', value: 'QSJJSDD' }] },
          { context: { userUid: memberUserUid } },
        );
      expect(updatedEvent.uid).toBe(event.uid);
      expect(updatedEvent.extIds).toStrictEqual([
        { key: 'test', value: 'QSJJSDD' },
        { key: 'test2', value: 'test' },
      ]);
    });

    it('if event does not exist, create it', async () => {
      const createdEvent = await core
        .agendas(17026855)
        .events.setByExtId('test', 'SQDSSQD', eventFixtures[2], {
          context: { userUid: memberUserUid },
        });

      expect(createdEvent.extIds).toStrictEqual([
        { key: 'test', value: 'SQDSSQD' },
      ]);
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

    it('create', async () => {
      response = await axios({
        method: 'put',
        url: 'http://localhost:4000/agendas/17026855/events/ext/test/something',
        headers: {
          'access-token': accessToken,
          'content-type': 'application/json',
        },
        data: {
          state: 0,
          featured: true,
          title: {
            fr: "Un événement mis à jour via l'api",
            en: 'An updated event through the api',
          },
          description: {
            fr: 'Une description',
            en: 'A desc',
          },
          location: {
            uid: 123,
          },
          timings: [
            {
              begin: new Date('2019-05-06T10:00:00'),
              end: new Date('2019-05-06T11:00:00'),
            },
            {
              begin: new Date('2019-05-06T12:00:00'),
              end: new Date('2019-05-06T13:00:00'),
            },
          ],
          custom_description: 'Meh',
          'categories-agenda-metropolitain': 43,
          'thematiques-bordeaux-metropole': [3],
          extIds: [{ key: 'test', value: 'something' }],
        },
      })
        .then((r) => r.data)
        .catch((e) => console.log(e));

      expect(response.extIds).toStrictEqual([
        { key: 'test', value: 'something' },
      ]);
    });

    it('update', async () => {
      response = await axios({
        method: 'put',
        url: 'http://localhost:4000/agendas/17026855/events/ext/test/thing',
        headers: {
          'access-token': accessToken,
          'content-type': 'application/json',
        },
        data: {
          state: 0,
          featured: true,
          title: {
            fr: "Un événement mis à jour via l'api",
            en: 'An updated event through the api',
          },
          description: {
            fr: 'Une description',
            en: 'A desc',
          },
          location: {
            uid: 123,
          },
          timings: [
            {
              begin: new Date('2019-05-06T10:00:00'),
              end: new Date('2019-05-06T11:00:00'),
            },
            {
              begin: new Date('2019-05-06T12:00:00'),
              end: new Date('2019-05-06T13:00:00'),
            },
          ],
          custom_description: 'Meh',
          'categories-agenda-metropolitain': 43,
          'thematiques-bordeaux-metropole': [3],
          extIds: [{ key: 'test', value: 'thing' }],
        },
      })
        .then((r) => r.data)
        .catch((e) => console.log(e));
      expect(response.uid).toBe(event.uid);
      expect(response.extIds).toStrictEqual([{ key: 'test', value: 'thing' }]);
    });
  });
});
