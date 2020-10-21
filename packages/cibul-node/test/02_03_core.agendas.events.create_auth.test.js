'use strict';

const _ = require('lodash');
const assert = require('assert');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const ih = require('immutability-helper');
const request = require('superagent');

const api = require('../api');
const assignClients = require('./utils/assignClients');
const Core = require('../core');
const Services = require('../services/init');
const eventsFixtures = require('./fixtures/events');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create api authentication', function() {
  let core;

  const eventData = {
    title: {
      fr: 'Un événement'
    },
    description: {
      fr: 'Un tout petit événement'
    },
    timings: [ {
      begin: new Date( '2019-05-06T10:00:00' ),
      end: new Date( '2019-05-06T11:00:00' )
    } ],
    keywords: {
      fr: [ 'un', 'deux', 'trois' ]
    },
    location: {
      uid: 123
    },
    'categories-agenda-metropolitain': 42,
    'thematiques-bordeaux-metropole' : [3, 4],
    accessibility: { sl: true }
  };

  beforeAll(() => loadFixtures(testConfig.db, '002.sql'));

  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
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

  afterAll(() => {
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  describe('errors', function() {
    let server, accessToken, response;

    beforeAll(done => {
       server = api(core).listen(3000, done);
    });

    afterAll(() => server.close());

    describe('wrong token', () => {
      let response;

      beforeAll(async () => {
        const result = await axios({
          method: 'post',
          url: 'http://localhost:3000/v2/requestAccessToken',
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
          url: 'http://localhost:3000/v2/requestAccessToken',
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
          url: 'http://localhost:3000/v2/agendas/17026855/events',
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
