'use strict';

const _ = require('lodash');
const axios = require('axios');

const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('08 - core - functional (server): core.agendas().members.list', () => {
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
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('results contents', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({ uid: 2 }).members.list({ limit: 2 }, {
        userUid: 50073466
      });
    });

    it('total, items and after keys are part of results', () => {
      expect(result.total).toBe(6);

      expect(_.isArray(result.items)).toBe(true);
      expect(_.isInteger(result.after)).toBe(true);
    });

    it('next result set can be fetched using "after" value', async () => {
      const nextResult = await core.agendas({ uid: 2 })
        .members.list({ after: result.after }, {
          userUid: 50073466
        });

      expect(nextResult.items.length).toBe(4);
    });

    it('customAtRoot option', async () => {
      const { items } = await core.agendas({ uid: 2 })
        .members.list({}, {
          customAtRoot: true,
          userUid: 50073466
        });

      expect(_.omit(items[0], 'updatedAt')).toEqual({
        name: 'Jan',
        phone: null,
        email: null,
        position: null,
        organization: null,
        role: 'contributor',
        userUid: 1
      });
    });
  });

  describe('unauthorized', () => {
    it('non-member user does not have access to list', async () => {
      let error;
      try {
        await core.agendas({ uid: 2 }).members.list({ limit: 2 }, {
          userUid: 99999967
        });
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('Forbidden');
    });

    it('contributor user does not have access to list', async () => {
      let error;
      try {
        await core.agendas({ uid: 2 }).members.list({ limit: 2 }, {
          userUid: 1
        });
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('Forbidden');
    });
  });

  describe('api', () => {
    const administratorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1NL';
    const contributorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
    const nonMemberKey = 'oI8hAhFOm1if8auC1Vg1NLegP36aMb0t';
    let server;

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    describe('successful call', () => {
      let response;

      beforeAll(async () => {
        response = await axios({
          method: 'get',
          url: `http://localhost:3000/agendas/2/members?key=${administratorKey}`
        }).then(r => r.data);
      });

      it('response includes a success, total, a list of items and an after key', () => {
        expect(Object.keys(response)).toEqual([
          'total',
          'after',
          'items',
          'success'
        ]);
      });
    });

    describe('unsuccessful calls', () => {
      it('Bad Request', async () => {
        let response;
        try {
          await axios({
            method: 'get',
            url: `http://localhost:3000/agendas/2/members?key=${administratorKey}&limit=1111`
          });
        } catch (e) {
          response = e.response;
        }

        expect(response.status).toBe(400);

        expect(response.data.errors).toEqual([{
          code: 'integer.toobig',
          message: 'the integer is too big',
          values: { max: 100 },
          origin: '1111',
          field: 'limit'
        }]);
      });

      it('Contributor does not have access to list', async () => {
        let response;
        try {
          await axios({
            method: 'get',
            url: `http://localhost:3000/agendas/2/members?key=${contributorKey}`
          });
        } catch (e) {
          response = e.response;
        }

        expect(response.status).toBe(403);
      });

      it('Non-member does not have access to list', async () => {
        let response;
        try {
          await axios({
            method: 'get',
            url: `http://localhost:3000/agendas/2/members?key=${nonMemberKey}`
          });
        } catch (e) {
          response = e.response;
        }

        expect(response.status).toBe(403);
      });
    });
  });
});
