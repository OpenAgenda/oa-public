import Sessions from '../src/service/index.js';
import isoConfig from '../src/iso/config.js';
import config from '../testconfig.js';
import * as h from './lib/helpers.js';

describe('session - functional (server): sync', () => {
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

  it('sync is used only when a session is open', async () => {
    await new Promise((resolve, reject) => {
      sessions.sync(request, (err, result) => {
        if (err) return reject(err);

        expect(result.success).toBe(false);

        resolve();
      });
    });
  });

  it('sync updates session with data fetched from getUser interface', async () => {
    const getUserResult = {
      id: 1,
      uid: 1234,
      email: 'blorg@cibul.net',
      culture: 'fr',
      name: 'Gaetanne',
      thumbnail: null,
    };

    const sessionsWithDifferentGetUser = Sessions({
      ...config,
      redisClient: client,
      interfaces: {
        getUser: (query, cb) => cb(null, getUserResult),
      },
    });

    await new Promise((resolve, reject) => {
      sessionsWithDifferentGetUser.open(
        request,
        { uid: 1234 },
        (err, result) => {
          if (err) return reject(err);

          expect(result.data.culture).toBe('fr');

          getUserResult.culture = 'en';

          sessionsWithDifferentGetUser.sync(request, (err1, result1) => {
            if (err1) return reject(err1);

            expect(result1.success).toBe(true);
            expect(result1.data.culture).toBe('en');

            resolve();
          });
        },
      );
    });
  });
});
