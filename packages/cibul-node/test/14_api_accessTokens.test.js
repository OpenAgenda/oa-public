'use strict';

const axios = require('axios');
const assert = require('assert');
const FormData = require('form-data');

const loadFixtures = require('./fixtures/load');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('14 - core - functional(server): api get accessToken', function() {
  let core, server;
  let accessToken;

  beforeAll(() => loadFixtures(testConfig.db, '015.sql'));

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
        'keys'
      ]
    });

    core = Core(services, testConfig);
  });

  beforeAll(done => {
    server = api(core).listen(3000, done);
  });

  const axiosJSONPayload = {
    method: 'post',
    url: 'http://localhost:3000/requestAccessToken',
    headers: {
      'content-type': 'application/json'
    },
    data: {
      code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM'
    }
  };

  beforeAll(async () => {
    accessToken = await axios(axiosJSONPayload).then(r => r.data.access_token);
  });

  afterAll(() => server.close());

  afterAll(() => core.services.shutdown({ clear: true }));

  it('access token was fetched through json post', () => {
    assert.equal(typeof accessToken, 'string');
    assert.equal(accessToken.length, 32);
  });

  it('access token can be fetched through multipart/form-data post', async () => {
    const form = new FormData();

    form.append('code', 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM');

    const accessToken = await axios({
      method: 'post',
      url: 'http://localhost:3000/requestAccessToken',
      headers: form.getHeaders(),
      data: form
    }).then(r => r.data.access_token);

    assert.equal(typeof accessToken, 'string');
  });

  it('expiry is pushed back when new request is made', async () => {
    await (new Promise(rs => setTimeout(rs, 1000)));

    const { data } = await axios(axiosJSONPayload);

    assert.equal(data.expires_in, 3600);
  });

});
