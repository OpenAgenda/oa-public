import ky from 'ky';
import api from '../api/index.js';
import Core from '../core/index.js';
import Services from '../services/init.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.agendas().events.create api authentication', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '002.sql.js'));

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
        'aggregators',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
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

  afterAll(() => core.services.shutdown({ clear: true }));

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // ignore
    }
  });

  describe('errors', () => {
    let server;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    describe('wrong token', () => {
      let response;

      beforeAll(async () => {
        const result = await ky
          .post('http://localhost:4000/requestAccessToken', {
            json: {
              code: 'N0ty3poxNSTtdPJHUG6896UseQhM',
            },
          })
          .json()
          .then(
            () => {},
            (e) => e,
          );

        response = result.response;
      });

      it('code is 401 unauthorized', () => {
        expect(response.status).toBe(401);
      });

      it('message', async () => {
        const errorData = await response.json();
        expect(errorData.message).toBe('Invalid key');
      });
    });

    describe('right token, wrong credentials', () => {
      let accessToken;
      let response;

      beforeAll(async () => {
        const tokenResponse = await ky
          .post('http://localhost:4000/requestAccessToken', {
            json: {
              code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
            },
          })
          .json();
        accessToken = tokenResponse.access_token;
      });

      beforeAll(async () => {
        response = await ky
          .post('http://localhost:4000/agendas/17026855/events', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              /* should not reach validation */
            },
          })
          .json()
          .then(
            () => {},
            (e) => e.response,
          );
      });

      it('response status is 403', () => {
        expect(response.status).toBe(403);
      });
    });
  });
});
