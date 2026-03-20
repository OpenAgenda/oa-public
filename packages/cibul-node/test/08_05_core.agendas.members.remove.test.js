import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('08 - core - functional (server): core.agendas().members.remove', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '009.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
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
        'keys',
        'trackers',
      ],
    });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
    await services.members.clearCache();
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
