import ky from 'ky';
import Core from '../core/index.js';
import api from '../api/index.js';
import Services from '../services/init.js';
import setup from './fixtures/setup.js';
import testConfig from './testConfig.js';

const enabled = [
  'knex',
  'redis',
  'auth',
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
  'accessTokens',
  'tracker',
  'images',
  'files',
  'imageFiles',
];

describe('core - functional: core.agendas().events.conversations', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['024.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

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
      const adminTokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL',
          },
        })
        .json();
      adminAccessToken = adminTokenResponse.access_token;

      // Get contributor access token
      const contributorTokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      contributorAccessToken = contributorTokenResponse.access_token;
    });

    describe('successful calls', () => {
      it('admin can create conversation via API endpoint', async () => {
        try {
          const response = await ky.post(
            'http://localhost:4000/agendas/1001/events/1/conversations',
            {
              headers: {
                'access-token': adminAccessToken,
              },
              json: {
                message: 'test conversation from admin',
              },
            },
          );
          expect(response.status).toBe(200);
          const responseData = await response.json();
          expect(responseData.success).toBe(true);
        } catch (error) {
          console.log('Error status:', error.response?.status);
          console.log(
            'Error data:',
            await error.response?.json().catch(() => {}),
          );
          console.log('Error headers:', error.response?.headers);
          throw error;
        }
      });
    });

    describe('unsuccessful calls', () => {
      it('contributor cannot create conversation', async () => {
        let response;

        try {
          await ky
            .post('http://localhost:4000/agendas/1001/events/1/conversations', {
              headers: {
                'access-token': contributorAccessToken,
              },
              json: {
                message: 'test conversation from contributor',
              },
            })
            .json();
        } catch (e) {
          response = e.response;
        }

        expect(response.status).toBe(403);
      });
    });
  });
});
