'use strict';

const axios = require('axios');
const FormData = require('form-data');

const Core = require('../core');
const api = require('../api');

const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('14 - core - functional(server): api get accessToken', () => {
  let core;
  let server;
  let accessToken;

  const config = testConfig.extendWith({ cachePrefix: 'c14_api_accessTokens_test' });

  beforeAll(() => loadFixtures(config.db, '015.sql'));

  beforeAll(async () => {
    const services = await Services(config, {
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
      ],
    });

    core = Core(services, config);
  });

  beforeAll(async () => {
    server = await api(core).listen(3000);
  });

  const axiosJSONPayload = {
    method: 'post',
    url: 'http://localhost:3000/requestAccessToken',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
    },
  };

  beforeAll(async () => {
    accessToken = await axios(axiosJSONPayload).then(r => r.data.access_token);
  });

  afterAll(() => server.close());

  afterAll(() => core.services.shutdown({ clear: true }));

  it('access token was fetched through json post', () => {
    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBe(32);
  });

  it('lastSignin timestamp of user account is refreshed when access token is obtained', async () => {
    const user = await core.users.get(1, { detailed: true });

    const lastSigninTimeFromNow = new Date().getTime() - new Date(user.lastSignin).getTime();

    expect(lastSigninTimeFromNow).toBeLessThan(1000);
  });

  it('access token can be fetched through multipart/form-data post', async () => {
    const form = new FormData();

    form.append('code', 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM');

    const otherAccessToken = await axios({
      method: 'post',
      url: 'http://localhost:3000/requestAccessToken',
      headers: form.getHeaders(),
      data: form,
    }).then(r => r.data.access_token);

    expect(typeof otherAccessToken).toBe('string');
  });

  it('expiry is pushed back when new request is made', async () => {
    await new Promise(rs => setTimeout(rs, 1000));

    const { data } = await axios(axiosJSONPayload);

    expect(data.expires_in).toBe(3600);
  });
});
