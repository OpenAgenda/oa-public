import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
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

  describe('last administrator guard', () => {
    it('cannot remove the last administrator of an agenda', async () => {
      let error;

      try {
        // lise (uid 50073466) is the only administrator of agenda 2
        await core
          .agendas(2)
          .members.remove({ userUid: 50073466 }, { userUid: 50073466 });
      } catch (e) {
        error = e;
      }

      expect(error?.name).toBe('Conflict');

      const rows = await core.services.knex('reviewer').select().where({
        agenda_uid: 2,
        user_uid: 50073466,
      });

      expect(rows.length).toBe(1);
    });

    it('can remove an administrator when another one remains', async () => {
      // add a second administrator to agenda 2 alongside lise
      await core.services.knex('reviewer').insert({
        id: 888888,
        agenda_uid: 2,
        user_uid: 888888,
        credential: 2,
        created_at: '2017-10-30 14:21:07',
        updated_at: '2017-10-30 14:21:07',
      });

      await core
        .agendas(2)
        .members.remove({ userUid: 888888 }, { userUid: 50073466 });

      const rows = await core.services.knex('reviewer').select().where({
        agenda_uid: 2,
        user_uid: 888888,
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
