'use strict';

const axios = require('axios');

const Services = require('../services/init');
const Core = require('../core');
const api = require('../api');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('10 - core - functional (server): core.users().remove()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '018.sql'));

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

  describe('core', () => {
    beforeAll(async () => {
      await core.users(99999967).remove();
    });

    it('user is marked as removed', async () => {
      const user = await core.services.users.findOne({
        query: { uid: 99999967 },
        removed: null,
        detailed: true
      });

      expect(user.isRemoved).toBe(true);
    });
  });

  describe('api', () => {
    let server;
    let accessToken;

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json'
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM'
        }
      }).then(r => r.data.access_token);
    });

    it('user can delete his own account', async () => {
      await axios({
        method: 'delete',
        url: 'http://localhost:3000/me',
        headers: {
          'access-token': accessToken,
          nonce: 1234,
          'content-type': 'application/json'
        }
      });

      const user = await core.services.users.findOne({
        query: { uid: 8929606 },
        removed: null,
        detailed: true
      });

      expect(user.isRemoved).toBe(true);
    });
  });
});
