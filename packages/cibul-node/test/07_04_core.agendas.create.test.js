import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import { withTestServer } from './helpers/startTestServer.js';

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
  'accessTokens',
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
  'tracker',
];

describe('07 - core - functional (server): core.agendas().create', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['008.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    describe('basic case', () => {
      let agenda;

      beforeAll(async () => {
        try {
          agenda = await core.agendas.create(
            {
              title: 'Un agenda',
              description: 'pour tester la création',
            },
            { userUid: 63170203 },
          );
        } catch (e) {
          console.log(JSON.stringify(e, null, 2));
        }
      });

      it('agenda is created', async () => {
        expect(agenda.title).toBe('Un agenda');
      });

      it('user is administrator of agenda', async () => {
        const member = await core
          .agendas(agenda.uid)
          .members.get(63170203, { access: 'internal' });

        expect(member.role).toBe('administrator');
      });
    });
  });

  describe('api', () => {
    let accessToken;

    const ctx = withTestServer(() => api(core, { useRouter: false }));

    beforeAll(async () => {
      const tokenResponse = await ky
        .post(`${ctx.baseUrl}/requestAccessToken`, {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    test('basic create', async () => {
      const response = await ky
        .post(`${ctx.baseUrl}/agendas`, {
          headers: {
            'access-token': accessToken,
          },
          json: {
            title: 'Un agenda créé via API',
            description: 'Test',
          },
        })
        .json();

      expect(response.title).toBe('Un agenda créé via API');
    });
  });
});
