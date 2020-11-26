'use strict';

const axios = require('axios');
const assert = require('assert');
const FormData = require('form-data');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('13 - core - functional(server): core.agendas().locations.list', function() {
  let core, server;

  beforeAll(() => loadFixtures(testConfig.db, '015.sql'));
  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
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
        'keys'
      ]
    });

    core = Core(services, testConfig);
  });

  beforeAll(done => {
    server = api(core).listen(3000, done);
  });

  afterAll(() => server.close());

  afterAll(() => {
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  it('access token can be fetched through json post', async () => {
    const accessToken = await axios({
      method: 'post',
      url: 'http://localhost:3000/v2/requestAccessToken',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM'
      }
    }).then(r => r.data.access_token);

    assert.equal(typeof accessToken, 'string');
    assert.equal(accessToken.length, 32);
  });

  it('access token can be fetched through multipart/form-data post', async () => {
    const form = new FormData();

    form.append('code', 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM');

    const accessToken = await axios({
      method: 'post',
      url: 'http://localhost:3000/v2/requestAccessToken',
      headers: form.getHeaders(),
      data: form
    }).then(r => r.data.access_token);

    assert.equal(typeof accessToken, 'string');
  });

});
