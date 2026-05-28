import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
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
  'trackers',
];

describe('08 - core - functional (server): core.agendas().members.remove', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['009.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('results contents', () => {
    it('basic remove', async () => {
      await core.agendas(2).members.remove(1, {
        userUid: 1,
      });

      const rows = await core.services.knex('reviewer').select().where({
        agenda_uid: 2,
        user_uid: 1,
      });

      expect(rows.length).toBe(0);
    });
  });

  describe('api', () => {
    let server;
    let accessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const tokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    describe('successfull call', () => {
      beforeAll(async () => {
        await ky
          .delete('http://localhost:4000/agendas/2/members/5', {
            headers: {
              'access-token': accessToken,
            },
          })
          .json();
      });

      it('member was removed', async () => {
        const entries = await core.services
          .knex('reviewer')
          .select()
          .where({ user_uid: 5, agenda_uid: 2 });

        expect(entries.length).toEqual(0);
      });
    });
  });
});
