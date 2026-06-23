import ky from 'ky';
import api from '../api/index.js';
import Core from '../core/index.js';
import Services from '../services/init.js';
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
  'aggregators',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
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

describe('core - functional (server): core.agendas().events.create api authentication', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['002.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
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

  describe('core', () => {
    const contributorUserUid = 63170203;

    it('contributor cannot edit moderator field', async () => {
      let error;
      try {
        await core.agendas(17026855).events.create(
          {
            title: {
              fr: 'Un événement',
            },
            description: {
              fr: 'Test de la lib core',
            },
            timings: [
              {
                begin: new Date('2019-05-06T10:00:00'),
                end: new Date('2019-05-06T11:00:00'),
              },
            ],
            location: {
              uid: 123,
            },
            'categories-agenda-metropolitain': 42,
            custom_description: 'Oui bah non',
          },
          {
            context: {
              userUid: contributorUserUid,
            },
            access: 'contributor',
          },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors).toStrictEqual([
        {
          field: 'custom_description',
          code: 'unauthorized',
          message: 'not authorized to edit this field',
          step: 'validation',
        },
      ]);
    });
  });

  describe('api', () => {
    describe('errors', () => {
      let server;
      let baseUrl;

      beforeAll(async () => {
        ({ server, baseUrl } = await startTestServer(
          api(core, { useRouter: false }),
        ));
      });

      afterAll(() => server.close());

      describe('wrong token', () => {
        let response;

        beforeAll(async () => {
          const result = await ky
            .post(`${baseUrl}/requestAccessToken`, {
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
            .post(`${baseUrl}/requestAccessToken`, {
              json: {
                code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
              },
            })
            .json();
          accessToken = tokenResponse.access_token;
        });

        beforeAll(async () => {
          response = await ky
            .post(`${baseUrl}/agendas/17026855/events`, {
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
});
