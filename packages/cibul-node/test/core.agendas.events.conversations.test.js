import axios from 'axios';
import Core from '../core/index.js';
import api from '../api/index.js';
import Services from '../services/init.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional: core.agendas().events.conversations', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '024.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'bull',
        'files',
        'events',
        'agendas',
        'inboxes',
        'aggregators',
        'agendaEvents',
        'eventSearch',
        'members',
        'networks',
        'users',
        'keys',
        'accessTokens',
        'tracker',
        'images',
        'files',
        'imageFiles',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      /* */
    }
  });

  afterAll(() => core.services.simpleCache.clearAll());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    it('first test', async () => {
      const resp = await core
        .agendas(1001)
        .events(1)
        .conversations.create({ message: 'test' }, { userUid: 1 });
      expect(resp).toBeTruthy();
    });
  });

  describe('api', () => {
    let server;
    let adminAccessToken;
    let contributorAccessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      // Get admin access token
      adminAccessToken = await axios({
        method: 'post',
        url: 'http://localhost:4000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL',
        },
      }).then((r) => r.data.access_token);

      // Get contributor access token
      contributorAccessToken = await axios({
        method: 'post',
        url: 'http://localhost:4000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      }).then((r) => r.data.access_token);
    });

    describe('successful calls', () => {
      it('admin can create conversation via API endpoint', async () => {
        try {
          const response = await axios({
            method: 'post',
            url: 'http://localhost:4000/agendas/1001/events/1/conversations',
            headers: {
              'access-token': adminAccessToken,
              'content-type': 'application/json',
            },
            data: {
              message: 'test conversation from admin',
            },
          });
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error) {
          console.log('Error status:', error.response?.status);
          console.log('Error data:', error.response?.data);
          console.log('Error headers:', error.response?.headers);
          throw error;
        }
      });
    });

    describe('unsuccessful calls', () => {
      it('contributor cannot create conversation', async () => {
        let response;

        try {
          await axios({
            method: 'post',
            url: 'http://localhost:4000/agendas/1001/events/1/conversations',
            headers: {
              'access-token': contributorAccessToken,
              'content-type': 'application/json',
            },
            data: {
              message: 'test conversation from contributor',
            },
          });
        } catch (e) {
          response = e.response;
        }

        expect(response.status).toBe(403);
      });
    });
  });
});
