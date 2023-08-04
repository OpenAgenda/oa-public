import axios from 'axios';
import api from '../api/index.mjs';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('08 - core - functional (server): core.agendas().members.patch', () => {
  let core;
  let services;

  beforeAll(() => loadFixtures(testConfig.db, '009.sql'));

  beforeAll(async () => {
    services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'queues',
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
        'legacy',
        'users',
        'keys',
        'trackers',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('results contents', () => {
    it('basic patch', async () => {
      await core.agendas(2).members.patch(1, {
        name: 'Janine',
        phone: '01',
        position: 'Gardienne',
        email: 'jan@ee.ne',
        organization: 'Ponceau Corp',
      }, {
        userUid: 1,
      });

      const result = await core.services.knex('reviewer').first()
        .where({
          agenda_uid: 2,
          user_uid: 1,
        }).then(r => JSON.parse(r.store).custom_fields);

      expect(result).toEqual({
        organization: 'Ponceau Corp',
        contact_name: 'Janine',
        contact_number: '01',
        contact_position: 'Gardienne',
        email: 'jan@ee.ne',
      });
    });

    it('basic patch with custom fields', async () => {
      await core.agendas(3).members.patch(1, {
        name: 'Jam',
        phone: '02',
        position: 'Gardien',
        email: 'jam@ee.ne',
        organization: 'Ponceau Corp',
        num_orga: '30org',
      }, {
        userUid: 1,
      });

      const result = await core.services.knex('reviewer').first()
        .where({
          agenda_uid: 3,
          user_uid: 1,
        }).then(r => JSON.parse(r.store).custom_fields);

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
        await core.agendas(2).members.patch(1, {
          name: 'Jayneen',
        }, {
          userUid: 99999967,
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('contributor cannot patch another member', async () => {
      let error;

      try {
        await core.agendas(2).members.patch(1, {
          name: 'Jayneen',
        }, {
          userUid: 5,
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('contributor cannot change own role', async () => {
      let error;

      try {
        await core.agendas(2).members.patch(1, {
          role: 'moderator',
        }, {
          userUid: 1,
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });
  });

  describe('api', () => {
    let server;
    let accessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(3000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL',
        },
      }).then(r => r.data.access_token);
    });

    describe('successfull call', () => {
      beforeAll(async () => {
        await axios({
          method: 'patch',
          url: 'http://localhost:3000/agendas/2/members/1',
          headers: {
            'access-token': accessToken,
            nonce: 12389708,
            'content-type': 'application/json',
          },
          data: {
            name: 'Hélène',
            position: 'Responsable de communication',
            phone: '04',
            role: 'administrator',
            email: 'el@h.en',
            organization: 'Très',
          },
        }).then(r => r.data);
      });

      it('member data is patched', async () => {
        const entry = await core.services.knex('reviewer')
          .first()
          .where({
            user_uid: 1,
            agenda_uid: 2,
          });

        expect(entry.credential).toBe(2);
        expect(JSON.parse(entry.store).custom_fields.contact_name).toBe('Hélène');
      });
    });
  });
});
