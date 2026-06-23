import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import startTestServer from './helpers/startTestServer.js';
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

describe('08 - core - functional (server): core.agendas().members.patch', () => {
  let core;
  let services;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['009.sql.js'],
    });
  });

  beforeAll(async () => {
    services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('results contents', () => {
    it('basic patch', async () => {
      await core.agendas(2).members.patch(
        1,
        {
          name: 'Janine',
          phone: '01',
          position: 'Gardienne',
          email: 'jan@ee.ne',
          organization: 'Ponceau Corp',
        },
        {
          userUid: 1,
        },
      );

      const result = await core.services
        .knex('reviewer')
        .first()
        .where({
          agenda_uid: 2,
          user_uid: 1,
        })
        .then((r) => JSON.parse(r.store).custom_fields);

      expect(result).toEqual({
        organization: 'Ponceau Corp',
        contact_name: 'Janine',
        contact_number: '01',
        contact_position: 'Gardienne',
        email: 'jan@ee.ne',
      });
    });

    it('basic patch with custom fields', async () => {
      await core.agendas(3).members.patch(
        1,
        {
          name: 'Jam',
          phone: '02',
          position: 'Gardien',
          email: 'jam@ee.ne',
          organization: 'Ponceau Corp',
          num_orga: '30org',
        },
        {
          userUid: 1,
        },
      );

      const result = await core.services
        .knex('reviewer')
        .first()
        .where({
          agenda_uid: 3,
          user_uid: 1,
        })
        .then((r) => JSON.parse(r.store).custom_fields);

      const custom = await core.services.custom(8).get(1);
      expect(custom.num_orga).toBe('30org');

      expect(result).toEqual({
        organization: 'Ponceau Corp',
        contact_name: 'Jam',
        contact_number: '02',
        contact_position: 'Gardien',
        email: 'jam@ee.ne',
      });
    });
  });

  describe('unsuccessful calls', () => {
    it('non-member cannot patch', async () => {
      let error;

      try {
        await core.agendas(2).members.patch(
          1,
          {
            name: 'Jayneen',
          },
          {
            userUid: 99999967,
          },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('contributor cannot patch another member', async () => {
      let error;

      try {
        await core.agendas(2).members.patch(
          1,
          {
            name: 'Jayneen',
          },
          {
            userUid: 5,
          },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('contributor cannot change own role', async () => {
      let error;

      try {
        await core.agendas(2).members.patch(
          1,
          {
            role: 'moderator',
          },
          {
            userUid: 1,
          },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('cannot demote the last administrator of an agenda', async () => {
      let error;

      try {
        // lise (uid 50073466) is the only administrator of agenda 2
        await core
          .agendas(2)
          .members.patch(
            { userUid: 50073466 },
            { role: 'moderator' },
            { userUid: 50073466 },
          );
      } catch (e) {
        error = e;
      }

      expect(error?.name).toBe('Conflict');

      const entry = await core.services.knex('reviewer').first().where({
        agenda_uid: 2,
        user_uid: 50073466,
      });

      expect(entry.credential).toBe(2);
    });

    it('can demote an administrator when another one remains', async () => {
      // add a second administrator to agenda 2 alongside lise
      await core.services.knex('reviewer').insert({
        id: 888889,
        agenda_uid: 2,
        user_uid: 888889,
        credential: 2,
        created_at: '2017-10-30 14:21:07',
        updated_at: '2017-10-30 14:21:07',
      });

      await core
        .agendas(2)
        .members.patch(
          { userUid: 888889 },
          { role: 'moderator' },
          { userUid: 50073466 },
        );

      const entry = await core.services.knex('reviewer').first().where({
        agenda_uid: 2,
        user_uid: 888889,
      });

      expect(entry.credential).toBe(3);
    });
  });

  describe('api', () => {
    let server;
    let baseUrl;
    let accessToken;

    beforeAll(async () => {
      ({ server, baseUrl } = await startTestServer(
        api(core, { useRouter: false }),
      ));
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const tokenResponse = await ky
        .post(`${baseUrl}/requestAccessToken`, {
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
          .patch(`${baseUrl}/agendas/2/members/1`, {
            headers: {
              'access-token': accessToken,
            },
            json: {
              name: 'Hélène',
              position: 'Responsable de communication',
              phone: '04',
              role: 'administrator',
              email: 'el@h.en',
              organization: 'Très',
            },
          })
          .json();
      });

      it('member data is patched', async () => {
        const entry = await core.services.knex('reviewer').first().where({
          user_uid: 1,
          agenda_uid: 2,
        });

        expect(entry.credential).toBe(2);
        expect(JSON.parse(entry.store).custom_fields.contact_name).toBe(
          'Hélène',
        );
      });
    });
  });
});
