import _ from 'lodash';
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

describe('08 - core - functional (server): core.agendas().members.get', () => {
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

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('successful gets', () => {
    it('basic get', async () => {
      const member = await core.agendas(2).members.get(1, {
        userUid: 50073466,
      });

      expect(_.omit(member, ['updatedAt'])).toEqual({
        deletedUser: false,
        name: 'Jan',
        phone: null,
        email: null,
        position: null,
        organization: null,
        role: 'contributor',
        // updatedAt: new Date('2017-10-30T13:21:07.000Z'),
        userUid: 1,
      });
    });

    it('contributor can access his data', async () => {
      const member = await core.agendas(2).members.get(1, {
        userUid: 1,
      });

      expect(member.name).toEqual('Jan');
    });

    it('basic get with custom values', async () => {
      const member = await core.agendas(3).members.get(6887, {
        userUid: 1,
      });

      expect(_.omit(member, ['updatedAt'])).toEqual({
        deletedUser: false,
        name: 'Constance',
        phone: null,
        email: 'con@stance.com',
        position: null,
        organization: null,
        role: 'contributor',
        // updatedAt: new Date('2017-10-30T13:21:07.000Z'), changes depending on timezone
        userUid: 6887,
        num_orga: '30org',
        participant: 3,
      });
    });
  });

  describe('unauthorized', () => {
    it('non member does not have access to get', async () => {
      let error;
      try {
        await core.agendas(2).members.get(1, {
          userUid: 99999967,
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('contributor does not have access to other member data', async () => {
      let error;
      try {
        await core.agendas(2).members.get(1, {
          userUid: 5,
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });
  });

  describe('api', () => {
    const contributorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
    const administratorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1NL';
    const nonMemberKey = 'oI8hAhFOm1if8auC1Vg1NLegP36aMb0t';

    let server;
    let baseUrl;

    beforeAll(async () => {
      ({ server, baseUrl } = await startTestServer(
        api(core, { useRouter: false }),
      ));
    });

    afterAll(() => server.close());

    describe('successful call', () => {
      let member;

      beforeAll(async () => {
        member = await ky
          .get(`${baseUrl}/agendas/2/members/1?key=${contributorKey}`)
          .json();
      });

      it('member data is provided', () => {
        expect(_.omit(member, ['updatedAt'])).toEqual({
          deletedUser: false,
          name: 'Jan',
          phone: null,
          email: null,
          position: null,
          organization: null,
          role: 'contributor',
          // updatedAt: '2017-10-30T13:21:07.000Z', changes depending on timezone
          userUid: 1,
        });
      });
    });

    it('get member from mail', async () => {
      const mail = 'lise.p@grois.fr';
      const res = await ky
        .get(
          `${baseUrl}/agendas/2/members/email/${mail}?key=${administratorKey}`,
        )
        .json();
      expect(_.omit(res, ['updatedAt'])).toEqual({
        userUid: 50073466,
        deletedUser: false,
        name: 'Lise',
        phone: null,
        email: null,
        organization: null,
        position: null,
        role: 'administrator',
        // updatedAt: '2017-10-30T13:21:07.000Z', changes depending on timezone
      });
    });

    describe('unsuccessful calls', () => {
      it('404', async () => {
        const response = await ky
          .get(`${baseUrl}/agendas/2/members/8978?key=${administratorKey}`)
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(404);
      });

      it('403 - contributor does not have access to other members data', async () => {
        const response = await ky
          .get(`${baseUrl}/agendas/2/members/5?key=${contributorKey}`)
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(403);
      });

      it('404 on getByEmail', async () => {
        const response = await ky
          .get(
            `${baseUrl}/agendas/2/members/email/test@toto.com?key=${administratorKey}`,
          )
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(response.status).toBe(404);
      });

      it('Non-member does not have access to get', async () => {
        const response = await ky
          .get(`${baseUrl}/agendas/2/members/8978?key=${nonMemberKey}`)
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
