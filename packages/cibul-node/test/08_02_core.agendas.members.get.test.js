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
    it('basic get', async () => {
      const member = await core.agendas({ uid: 2 }).members.get(1);

      expect(member).toEqual({
        name: 'Jan',
        phone: null,
        email: null,
        position: null,
        organization: null,
        role: 'contributor'
      });
    });
  });

  describe('api', () => {
    const key = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
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
          url: `http://localhost:3000/agendas/2/members/1?key=${key}`
        }).then(r => r.data);
      });

      it('member data is provided', () => {
        expect(member).toEqual({
          name: 'Jan',
          phone: null,
          email: null,
          position: null,
          organization: null,
          role: 'contributor'
        });
      });
    });

    /* describe('unsuccessful calls', async () => {
      it('contributor does not have access to other members data', async () => {

      });
    }); */
  });
});
