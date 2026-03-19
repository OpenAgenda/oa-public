import _ from 'lodash';
import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('08 - core - functional (server): core.agendas().members.create', () => {
  let core;
  let services;

  beforeAll(() => loadFixtures(testConfig.db, '009.sql.js'));

  beforeAll(async () => {
    services = await Services(testConfig, {
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
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('results contents', () => {
    it('basic create', async () => {
      const member = await core.agendas(2).members.create(
        82253124,
        'administrator',
        {
          name: 'Fred',
          phone: '06',
        },
        {
          userUid: 50073466,
        },
      );

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
      const member = await core.agendas(93399464).members.create(
        99999967,
        'contributor',
        {
          name: 'Jean-Benoit',
        },
        {
          userUid: 99999967,
        },
      );

      expect(member.role).toBe('contributor');
    });

    it('admin can add contributor with values to custom fields', async () => {
      await core.agendas(3).members.create(
        63460,
        'contributor',
        {
          name: 'JayBee',
          organization: 'thingy',
          position: 'boss',
          email: 'my@mail.com',
          num_orga: '30org',
        },
        {
          userUid: 1, // actingUserIid
        },
      );
      const custom = await services.custom(8).get(63460);
      const member = await services.members.get({
        agendaUid: 3,
        userUid: 63460,
      });
      expect({
        customValue: custom.num_orga,
        memberName: member.custom.contactName,
      }).toStrictEqual({ customValue: '30org', memberName: 'JayBee' });
    });

    it('admin can add admin with values to custom fields', async () => {
      await core.agendas(3).members.create(
        9090,
        'administrator',
        {
          name: 'JayBee',
          organization: 'thingy',
          num_orga: '30org',
        },
        {
          userUid: 1, // actingUserUid
        },
      );
      const custom = await services.custom(8).get(9090);
      const member = await services.members.get({
        agendaUid: 3,
        userUid: 9090,
      });
      expect({
        customValue: custom.num_orga,
        memberName: member.custom.contactName,
      }).toStrictEqual({ customValue: '30org', memberName: 'JayBee' });
    });

    it('can create member with silent option', async () => {
      const member = await core.agendas(2).members.create(
        82253125,
        'contributor',
        {
          name: 'Silent Fred',
          phone: '07',
        },
        {
          userUid: 50073466,
          context: {
            silent: true,
          },
        },
      );

      expect(_.omit(member, 'updatedAt')).toEqual({
        deletedUser: false,
        name: 'Silent Fred',
        phone: '07',
        email: null,
        position: null,
        organization: null,
        role: 'contributor',
        userUid: 82253125,
      });

      // Verify the member was actually created in the database
      const dbMember = await services.members.get({
        agendaUid: 2,
        userUid: 82253125,
      });
      expect(dbMember).toBeTruthy();
      expect(dbMember.custom.contactName).toBe('Silent Fred');
    });
  });

  describe('unsuccessful creates', () => {
    it('contributor cannot add a member', async () => {
      let error;

      try {
        await core.agendas(2).members.create(
          10866730,
          'contributor',
          {
            name: 'Hélène',
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

    it('user cannot add himself on members only agenda', async () => {
      let error;

      try {
        await core.agendas(2).members.create(
          99999967,
          'contributor',
          {
            name: 'JayBee',
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
  });

  describe('api', () => {
    let server;
    let adminAccessToken;
    let nonMemberAccessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const adminTokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL',
          },
        })
        .json();
      adminAccessToken = adminTokenResponse.access_token;

      const nonMemberTokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJseQhLHUG6896U',
          },
        })
        .json();
      nonMemberAccessToken = nonMemberTokenResponse.access_token;
    });

    describe('successfull call', () => {
      beforeAll(async () => {
        await ky
          .post('http://localhost:4000/agendas/2/members', {
            headers: {
              'access-token': adminAccessToken,
            },
            json: {
              name: 'Hélène',
              position: 'Responsable de communication',
              role: 'administrator',
              userUid: 10866730,
            },
          })
          .json();
      });

      it('member data is saved', async () => {
        const entry = await core.services
          .knex('reviewer')
          .first()
          .where({ user_uid: 10866730, agenda_uid: 2 });

        expect(entry.credential).toBe(2);
        expect(JSON.parse(entry.store).custom_fields.contact_name).toBe(
          'Hélène',
        );
      });

      it('member invite', async () => {
        await ky.post('http://localhost:4000/agendas/2/members/invite', {
          headers: {
            'access-token': adminAccessToken,
          },
          json: {
            role: 1,
            emails: [
              'clement.lecroart@openagenda.com',
              'clement.lecro@bidul.chouette',
            ],
          },
        });
        const member = await services.members.get.byEmail({
          agendaUid: 2,
          email: 'clement.lecroart@openagenda.com',
        });
        const member2 = await services.members.get.byEmail({
          agendaUid: 2,
          email: 'clement.lecro@bidul.chouette',
        });
        expect(member.id).toBeTruthy();
        expect(member2.id).toBeTruthy();
      });

      it('member invite with one email already a member', async () => {
        // First, ensure one email is already a member
        const existingEmail = 'existing.member@openagenda.com';
        const newEmail = 'new.member@openagenda.com';

        // Create the existing member first
        await ky.post('http://localhost:4000/agendas/2/members/invite', {
          headers: {
            'access-token': adminAccessToken,
          },
          json: {
            role: 1,
            emails: [existingEmail],
          },
        });

        // Verify the existing member was created
        const existingMember = await services.members.get.byEmail({
          agendaUid: 2,
          email: existingEmail,
        });
        expect(existingMember.id).toBeTruthy();

        // Now invite both the existing member and a new member
        const resp = await ky
          .post('http://localhost:4000/agendas/2/members/invite', {
            headers: {
              'access-token': adminAccessToken,
            },
            json: {
              role: 1,
              emails: [existingEmail, newEmail],
            },
          })
          .json();

        // Verify the new member was created
        const newMember = await services.members.get.byEmail({
          agendaUid: 2,
          email: newEmail,
        });
        expect(newMember.id).toBeTruthy();

        // Verify the existing member still exists
        const stillExistingMember = await services.members.get.byEmail({
          agendaUid: 2,
          email: existingEmail,
        });
        // Verify response structure
        expect(resp.processed).toBeDefined();
        expect(resp.already).toBeDefined();

        // The new member should be in processed
        expect(resp.processed).toHaveLength(1);
        expect(resp.processed[0].email).toBe(newEmail);

        // The existing member should be in already
        expect(resp.already).toHaveLength(1);
        expect(resp.already[0].email).toBe(existingEmail);

        expect(stillExistingMember.id).toBeTruthy();
        expect(stillExistingMember.id).toBe(existingMember.id);
      });

      it('can create member with silent option through API', async () => {
        await ky
          .post('http://localhost:4000/agendas/2/members?silent=1', {
            headers: {
              'access-token': adminAccessToken,
            },
            json: {
              name: 'Silent Marie',
              position: 'Developer',
              role: 'contributor',
              userUid: 82253126,
            },
          })
          .json();

        const entry = await core.services
          .knex('reviewer')
          .first()
          .where({ user_uid: 82253126, agenda_uid: 2 });

        expect(entry.credential).toBe(1);
        expect(JSON.parse(entry.store).custom_fields.contact_name).toBe(
          'Silent Marie',
        );

        // Verify the member was created in the service as well
        const member = await services.members.get({
          agendaUid: 2,
          userUid: 82253126,
        });
        expect(member).toBeTruthy();
        expect(member.custom.contactName).toBe('Silent Marie');
      });
    });

    describe('non member call', () => {
      it('user can add himself on open agenda through api', async () => {
        await ky
          .post('http://localhost:4000/agendas/48353388/members', {
            headers: {
              'access-token': nonMemberAccessToken,
            },
            json: {
              name: 'Chris sie',
              position: 'Petite main',
              role: 'contributor',
              userUid: 24372732,
            },
          })
          .json();

        const entry = await core.services.knex('reviewer').first().where({
          user_uid: 24372732,
          agenda_uid: 48353388,
        });

        expect(entry.credential).toBe(1);
        expect(JSON.parse(entry.store).custom_fields.contact_name).toBe(
          'Chris sie',
        );
      });
    });

    describe('unsuccessful calls', () => {
      it('non-member cannot create member other than himself', async () => {
        const response = await ky
          .post('http://localhost:4000/agendas/2/members', {
            headers: {
              'access-token': nonMemberAccessToken,
            },
            json: {
              name: 'Hélène',
              position: 'Responsable de communication',
              role: 'administrator',
              userUid: 10866730,
            },
          })
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(403);
      });

      it('contributor cannot create member', async () => {
        const contributorTokenResponse = await ky
          .post('http://localhost:4000/requestAccessToken', {
            json: {
              code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
            },
          })
          .json();
        const contributorAccessToken = contributorTokenResponse.access_token;

        const response = await ky
          .post('http://localhost:4000/agendas/2/members', {
            headers: {
              'access-token': contributorAccessToken,
            },
            json: {
              name: 'Hélène',
              position: 'Responsable de communication',
              role: 'administrator',
              userUid: 10866730,
            },
          })
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(403);
      });
    });
  });
});
