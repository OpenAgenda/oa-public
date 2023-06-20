import axios from 'axios';
import FormData from 'form-data';
import Core from '../core/index.js';
import api from '../api/index.mjs';
import Services from '../services/init.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('14 - core - functional(server): api authentication and posts', () => {
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

    expect(data.expires_in).toBeGreaterThanOrEqual(3600 - 2); // slow tests may take a second or two
  });

  it('nonce must be less or equal than 16 digits long', async () => {
    const longNonce = Number.MAX_SAFE_INTEGER + 1;
    let error;
    const {
      data: {
        access_token: token,
      },
    } = await axios(axiosJSONPayload);

    try {
      await axios({
        method: 'get',
        headers: {
          'access-token': token,
          nonce: longNonce,
          'content-type': 'application/json',
        },
        url: 'http://localhost:3000/agendas/123',
      });
    } catch (e) {
      error = e.response;
    }
    expect(error.status).toBe(400);
    expect(error.data.message).toBe('nonce is not valid');
  });

  it('agenda key can be used for read operations', async () => {
    const response = await axios({
      method: 'get',
      url: 'http://localhost:3000/agendas/123/events?key=e830934e9d1848189ac74de3bfa7df0a',
    });

    expect(response.status).toBe(200);
  });

  it('an agenda key on a /me/agendas call should throw a 403', async () => {
    const {
      error
    } = await axios({
      method: 'get',
      url: 'http://localhost:3000/me/agendas?key=e830934e9d1848189ac74de3bfa7df0a',
    }).then(r => ({ response: r }), e => ({ error: e }));

    expect(error.response.status).toBe(403);
    expect(error.response.data.message).toBe('agenda key cannot be used for this route');
  });
});
