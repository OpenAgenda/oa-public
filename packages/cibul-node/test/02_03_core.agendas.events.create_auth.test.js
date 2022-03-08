'use strict';

const _ = require('lodash');
const assert = require('assert');
const axios = require('axios');

const api = require('../api');
const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create api authentication', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '002.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
        'files',
        'events',
        'agendas',
        'aggregators',
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
        'accessTokens',
        'tracker',
        'images',
        'files',
        'imageFiles'
      ]
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  describe('errors', function() {
    let server;

    beforeAll(done => {
       server = api(core).listen(3000, done);
    });

    afterAll(() => server.close());

    describe('wrong token', () => {
      let response;

      beforeAll(async () => {
        const result = await axios({
          method: 'post',
          url: 'http://localhost:3000/requestAccessToken',
          headers: {
            'content-type': 'application/json'
          },
          data: {
            code: 'N0ty3poxNSTtdPJHUG6896UseQhM'
          }
        }).then(() => {}, e => e);

        response = result.response;
      });

      it('code is 401 unauthorized', () => {
        assert(response.status === 401);
      });

      it('message', () => {
        assert(response.data.message === 'Invalid key');
      });
    });

    describe('right token, wrong credentials', () => {
      let accessToken;
      let response;

      beforeAll(async () => {
        accessToken = await axios({
          method: 'post',
          url: 'http://localhost:3000/requestAccessToken',
          headers: {
            'content-type': 'application/json'
          },
          data: {
            code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM'
          }
        }).then(r => r.data.access_token);
      });

      beforeAll(async () => {
        response = await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 123,
            'content-type': 'application/json'
          },
          data: {/* should not reach validation */}
        }).then(() => {}, e => e.response);
      });

      it('response status is 403', () => {
        assert(response.status === 403);
      });

    });

  });

});
