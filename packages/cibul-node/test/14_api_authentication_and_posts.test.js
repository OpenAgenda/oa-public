import ky from 'ky';
import Core from '../core/index.js';
import api from '../api/index.js';
import Services from '../services/init.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'files',
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
  'users',
];

describe('14 - core - functional(server): api authentication and posts', () => {
  let core;
  let server;
  let accessToken;

  const config = testConfig.extendWith({
    cachePrefix: 'c14_api_accessTokens_test',
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['015.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(123).events.search.rebuild();
  });

  beforeAll(async () => {
    server = await api(core, { useRouter: false }).listen(4000);
  });

  const tokenRequest = () =>
    ky.post('http://localhost:4000/requestAccessToken', {
      json: {
        code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
      },
    });

  beforeAll(async () => {
    const tokenResponse = await tokenRequest().json();
    accessToken = tokenResponse.access_token;
  });

  afterAll(() => server.close());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('access token', () => {
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

      const tokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          body: form,
        })
        .json();
      const otherAccessToken = tokenResponse.access_token;

      expect(typeof otherAccessToken).toBe('string');
    });

    it('expiry is pushed back when new request is made', async () => {
      await new Promise((rs) => setTimeout(rs, 1000));

      const data = await tokenRequest().json();

      expect(data.expires_in).toBeGreaterThanOrEqual(3600 - 2); // slow tests may take a second or two
    });

    it('access token can be used via header authorization', async () => {
      const response = await ky.get(
        'http://localhost:4000/agendas/123/events',
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );

      expect(response.status).toBe(200);
    });
  });

  describe('agenda key', () => {
    it('agenda key can be used for read operations', async () => {
      const response = await ky.get(
        'http://localhost:4000/agendas/123/events?key=e830934e9d1848189ac74de3bfa7df0a',
      );

      expect(response.status).toBe(200);
    });

    it('agenda key can be used for read operations - header authorization', async () => {
      const response = await ky.get(
        'http://localhost:4000/agendas/123/events',
        {
          headers: {
            authorization: 'Bearer e830934e9d1848189ac74de3bfa7df0a',
          },
        },
      );

      expect(response.status).toBe(200);
    });

    it('an agenda key on a /me/agendas call should throw a 403', async () => {
      const error = await ky
        .get(
          'http://localhost:4000/me/agendas?key=e830934e9d1848189ac74de3bfa7df0a',
        )
        .json()
        .then(
          () => {},
          (err) => err,
        );

      expect(error.response.status).toBe(403);
      const errorData = await error.response.json();
      expect(errorData.message).toBe(
        'agenda key cannot be used for this route',
      );
    });
  });

  describe('user key', () => {
    const userKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

    it('/me/agendas route is not accessible if no key is provided', async () => {
      const error = await ky
        .get('http://localhost:4000/me/agendas')
        .json()
        .then(
          () => {},
          (err) => err,
        );

      expect(error.response.status).toBe(403);
      const errorData = await error.response.json();
      expect(errorData.message).toBe(
        'could not find user or agenda matching key',
      );
    });

    it('a public key provided in header authorization can be used to access /me/agendas route', async () => {
      const response = await ky.get('http://localhost:4000/me/agendas', {
        headers: {
          authorization: `Bearer ${userKey}`,
        },
      });

      expect(response.status).toBe(200);
    });

    it('a public key provided in query can be used to access /me/agendas route', async () => {
      const response = await ky.get(
        `http://localhost:4000/me/agendas?key=${userKey}`,
      );

      expect(response.status).toBe(200);
    });

    it('a public key provided in query can be placed in headers to access /me/agendas route', async () => {
      const response = await ky.get('http://localhost:4000/me/agendas', {
        headers: {
          key: userKey,
        },
      });

      expect(response.status).toBe(200);
    });
  });
});
