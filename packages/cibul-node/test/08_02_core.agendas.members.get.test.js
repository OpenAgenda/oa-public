'use strict';

const axios = require('axios');

const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('08 - core - functional (server): core.agendas().members.get', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '009.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'queues',
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
        'trackers'
      ]
    });

    core = Core(services, testConfig);

    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('successful gets', () => {
    it('basic get', async () => {
      const member = await core.agendas({ uid: 2 }).members.get(1, {
        userUid: 50073466
      });

      expect(member).toEqual({
        deletedUser: false,
        name: 'Jan',
        phone: null,
        email: null,
        position: null,
        organization: null,
        role: 'contributor',
        updatedAt: new Date('2017-10-30T13:21:07.000Z'),
        userUid: 1
      });
    });

    it('contributor can access his data', async () => {
      const member = await core.agendas({ uid: 2 }).members.get(1, {
        userUid: 1
      });

      expect(member.name).toEqual('Jan');
    });

    it('basic get with custom values', async () => {
      const member = await core.agendas({ uid: 3 }).members.get(6887, {
        userUid: 1
      });

      expect(member).toEqual({
        deletedUser: false,
        name: 'Constance',
        phone: null,
        email: 'con@stance.com',
        position: null,
        organization: null,
        role: 'contributor',
        updatedAt: new Date('2017-10-30T13:21:07.000Z'),
        userUid: 6887,
        num_orga: '30org'
      });
    });
  });

  describe('unauthorized', () => {
    it('non member does not have access to get', async () => {
      let error;
      try {
        await core.agendas({ uid: 2 }).members.get(1, {
          userUid: 99999967
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('Forbidden');
    });

    it('contributor does not have access to other member data', async () => {
      let error;
      try {
        await core.agendas({ uid: 2 }).members.get(1, {
          userUid: 5
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

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    describe('successful call', () => {
      let member;

      beforeAll(async () => {
        member = await axios({
          method: 'get',
          url: `http://localhost:3000/agendas/2/members/1?key=${contributorKey}`
        }).then(r => r.data);
      });

      it('member data is provided', () => {
        expect(member).toEqual({
          deletedUser: false,
          name: 'Jan',
          phone: null,
          email: null,
          position: null,
          organization: null,
          role: 'contributor',
          updatedAt: '2017-10-30T13:21:07.000Z',
          userUid: 1
        });
      });
    });

    describe('unsuccessful calls', () => {
      it('404', async () => {
        let error;
        try {
          await axios({
            method: 'get',
            url: `http://localhost:3000/agendas/2/members/8978?key=${administratorKey}`
          });
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(404);
      });

      it('403 - contributor does not have access to other members data', async () => {
        let error;
        try {
          await axios({
            method: 'get',
            url: `http://localhost:3000/agendas/2/members/5?key=${contributorKey}`
          });
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(403);
      });

      it('Non-member does not have access to get', async () => {
        let response;
        try {
          await axios({
            method: 'get',
            url: `http://localhost:3000/agendas/2/members/8978?key=${nonMemberKey}`
          });
        } catch (e) {
          response = e.response;
        }

        expect(response.status).toBe(403);
      });
    });
  });
});
