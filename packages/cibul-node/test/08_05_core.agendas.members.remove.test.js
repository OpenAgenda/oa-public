'use strict';

const axios = require('axios');

const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('08 - core - functional (server): core.agendas().members.remove', () => {
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
    it('basic remove', async () => {
      await core.agendas(2).members.remove(1, {
        userUid: 1,
      });

      const rows = await core.services.knex('reviewer').select()
        .where({
          agenda_uid: 2,
          user_uid: 1,
        });

      expect(rows.length).toBe(0);
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
          method: 'delete',
          url: 'http://localhost:3000/agendas/2/members/5',
          headers: {
            'access-token': accessToken,
            nonce: 12382108,
            'content-type': 'application/json',
          },
        }).then(r => r.data);
      });

      it('member was removed', async () => {
        const entries = await core.services.knex('reviewer')
          .select()
          .where({ user_uid: 5, agenda_uid: 2 });

        expect(entries.length).toEqual(0);
      });
    });
  });
});
