import _ from 'lodash';
import axios from 'axios';
import api from '../api/index.mjs';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('08 - core - functional (server): core.agendas().members.create', () => {
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
    it('basic create', async () => {
      const member = await core.agendas(2).members.create(82253124, 'administrator', {
        name: 'Fred',
        phone: '06',
      }, {
        userUid: 50073466,
      });

      expect(_.omit(member, 'updatedAt')).toEqual({
        deletedUser: false,
        name: 'Fred',
        phone: '06',
        email: null,
        position: null,
        organization: null,
        role: 'administrator',
        userUid: 82253124,
      });
    });

    it('user can add himself on open agenda', async () => {
      const member = await core.agendas(93399464).members.create(99999967, 'contributor', {
        name: 'Jean-Benoit',
      }, {
        userUid: 99999967,
      });

      expect(member.role).toBe('contributor');
    });

    it('admin can add contributor with values to custom fields', async () => {
      await core.agendas(3).members.create(63460, 'contributor', {
        name: 'JayBee',
        organization: 'thingy',
        position: 'boss',
        email: 'my@mail.com',
        num_orga: '30org',
      }, {
        userUid: 1, // actingUserIid
      });
      const custom = await services.custom(8).get(63460);
      const member = await services.members.get({ agendaUid: 3, userUid: 63460 });
      expect({ customValue: custom.num_orga, memberName: member.custom.contactName }).toStrictEqual({ customValue: '30org', memberName: 'JayBee' });
    });

    it('admin can add admin with values to custom fields', async () => {
      await core.agendas(3).members.create(9090, 'administrator', {
        name: 'JayBee',
        organization: 'thingy',
        num_orga: '30org',
      }, {
        userUid: 1, // actingUserUid
      });
      const custom = await services.custom(8).get(9090);
      const member = await services.members.get({ agendaUid: 3, userUid: 9090 });
      expect({ customValue: custom.num_orga, memberName: member.custom.contactName }).toStrictEqual({ customValue: '30org', memberName: 'JayBee' });
    });
  });

  describe('unsuccessful creates', () => {
    it('contributor cannot add a member', async () => {
      let error;

      try {
        await core.agendas(2).members.create(10866730, 'contributor', {
          name: 'Hélène',
        }, {
          userUid: 5,
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('user cannot add himself on members only agenda', async () => {
      let error;

      try {
        await core.agendas(2).members.create(99999967, 'contributor', {
          name: 'JayBee',
        }, {
          userUid: 99999967,
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });
  });

  describe('api', () => {
    let server;
    let adminAccessToken;
    let nonMemberAccessToken;

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      adminAccessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL',
        },
      }).then(r => r.data.access_token);

      nonMemberAccessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJseQhLHUG6896U',
        },
      }).then(r => r.data.access_token);
    });

    describe('successfull call', () => {
      beforeAll(async () => {
        await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/2/members',
          headers: {
            'access-token': adminAccessToken,
            nonce: 1238978,
            'content-type': 'application/json',
          },
          data: {
            name: 'Hélène',
            position: 'Responsable de communication',
            role: 'administrator',
            userUid: 10866730,
          },
        }).then(r => r.data);
      });

      it('member data is saved', async () => {
        const entry = await core.services.knex('reviewer')
          .first()
          .where({ user_uid: 10866730, agenda_uid: 2 });

        expect(entry.credential).toBe(2);
        expect(JSON.parse(entry.store).custom_fields.contact_name).toBe('Hélène');
      });

      it('member invite', async () => {
        await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/2/members/invite',
          headers: {
            'access-token': adminAccessToken,
            nonce: 1238979,
            'content-type': 'application/json',
          },
          data: {
            role: 1,
            emails: ['clement.lecroart@openagenda.com', 'clement.lecro@bidul.chouette'],
          },
        });
        const member = await services.members.get.byEmail({ agendaUid: 2, email: 'clement.lecroart@openagenda.com' });
        const member2 = await services.members.get.byEmail({ agendaUid: 2, email: 'clement.lecro@bidul.chouette' });
        expect(member.id).toBeTruthy();
        expect(member2.id).toBeTruthy();
      });
    });

    describe('non member call', () => {
      it('user can add himself on open agenda through api', async () => {
        await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/48353388/members',
          headers: {
            'access-token': nonMemberAccessToken,
            nonce: 1238979,
            'content-type': 'application/json',
          },
          data: {
            name: 'Chris sie',
            position: 'Petite main',
            role: 'contributor',
            userUid: 24372732,
          },
        }).then(r => r.data);

        const entry = await core.services.knex('reviewer')
          .first()
          .where({
            user_uid: 24372732,
            agenda_uid: 48353388,
          });

        expect(entry.credential).toBe(1);
        expect(JSON.parse(entry.store).custom_fields.contact_name).toBe('Chris sie');
      });
    });

    describe('unsuccessful calls', () => {
      it('non-member cannot create member other than himself', async () => {
        let response;

        try {
          await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/2/members',
            headers: {
              'access-token': nonMemberAccessToken,
              nonce: 89189389,
              'content-type': 'application/json',
            },
            data: {
              name: 'Hélène',
              position: 'Responsable de communication',
              role: 'administrator',
              userUid: 10866730,
            },
          });
        } catch (e) {
          response = e.response;
        }

        expect(response.status).toBe(403);
      });

      it('contributor cannot create member', async () => {
        let response;
        const contributorAccessToken = await axios({
          method: 'post',
          url: 'http://localhost:3000/requestAccessToken',
          headers: {
            'content-type': 'application/json',
          },
          data: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        }).then(r => r.data.access_token);

        try {
          await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/2/members',
            headers: {
              'access-token': contributorAccessToken,
              nonce: 89189389,
              'content-type': 'application/json',
            },
            data: {
              name: 'Hélène',
              position: 'Responsable de communication',
              role: 'administrator',
              userUid: 10866730,
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
