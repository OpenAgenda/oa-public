import Sessions from '../src/service/index.js';
import config from '../testconfig.js';
import isoConfig from '../src/iso/config.js';
import * as serviceHelpers from '../src/service/helpers/index.js';
import * as h from './lib/helpers.js';

describe('session - functional (server): isLogged & getCulture', () => {
  let client;
  let request;
  let sessions;

  beforeAll(async () => {
    client = await h.createClient(config.redis);
  });

  beforeEach(() => h.clearRedis(config.redis, client));

  beforeAll(() => {
    sessions = Sessions({
      ...config,
      redisClient: client,
    });
  });

  beforeEach(() => {
    request = {
      cookies: {},
      session: {},
    };

    request.cookies[isoConfig.cookies.session] = 'therandomsessioncode';
  });

  afterAll(() => client.quit());

  describe('.isLogged', () => {
    beforeEach(async () => {
      await new Promise((resolve, reject) => {
        sessions.open(request, { uid: 12345678 }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    it('determines based on request when user is logged', async () => {
      const req = {
        session: {
          user: {
            name: 'gaetan',
            uid: 12345678,
            culture: 'fr',
          },
        },
        cookies: {},
      };

      req.cookies[isoConfig.cookies.session] = 'therandomsessioncode';

      expect(await sessions.isLogged(req)).toBe(true);
    });

    it('.. and when the user is not logged', async () => {
      const req = {
        session: {},
        cookies: {},
      };

      req.cookies[isoConfig.cookies.session] = 'therandomsessioncode';

      expect(await sessions.isLogged(req)).toBe(false);
    });
  });

  describe('helpers', () => {
    it('helpers.cleanSession does not remove keys from session object', () => {
      const session = { somekey: '123' };

      expect(serviceHelpers.cleanSession(session)).toEqual({
        somekey: '123',
        expires: undefined,
        sessionId: null,
      });
    });
  });

  describe('.getCulture', () => {
    it('gets culture when user is logged', () => {
      const req = {
        session: {
          user: { name: 'gaetan', uid: 123, culture: 'en' },
        },
      };

      expect(sessions.getCulture(req)).toBe('en');
    });

    it('returns null when user is not logged', () => {
      const req = {
        session: {},
      };

      expect(sessions.getCulture(req)).toBeNull();
    });
  });
});
