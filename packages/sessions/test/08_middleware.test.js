import _ from 'lodash';
import config from '../testconfig.js';
import Sessions from '../src/service/index.js';
import * as helpers from './lib/helpers.js';

function createFetchAgent() {
  let cookieHeader = null;

  const agentFetch = async (url, options = {}) => {
    if (cookieHeader) {
      options.headers = { ...options.headers, Cookie: cookieHeader };
    }

    const response = await fetch(url, options);

    const newCookies = response.headers.get('set-cookie');
    if (newCookies) {
      cookieHeader = newCookies
        .split(/, (?=[a-zA-Z0-9_.-]+=)/)
        .map((c) => c.split(';')[0])
        .join('; ');
    }

    return response;
  };

  const getCookies = (asObject = true) => {
    if (!cookieHeader) {
      return asObject ? {} : null;
    }
    if (!asObject) {
      return cookieHeader;
    }
    return cookieHeader.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      if (key) acc[key] = value;
      return acc;
    }, {});
  };

  return {
    fetch: agentFetch,
    getCookies,
  };
}

describe('session - functional (server): middleware', () => {
  let client;

  beforeAll(async () => {
    client = await helpers.createClient(config.redis);
  });

  beforeEach(() => helpers.clearRedis(config.redis, client));

  afterAll(() => client.quit());

  describe('.sync', () => {
    let server;
    let sessionsWithGetUser;

    const getUserResult = {
      id: 1,
      uid: 12345678,
      isNew: false,
      name: 'Gaetan Latouche',
      thumbnail: '//graph.facebook.com/100002280111541/picture',
      email: 'gaetan@cibul.net',
      transverseApiAccess: false,
    };

    let culture = 'fr';

    async function _runClientSyncRoutine() {
      const agent = createFetchAgent();
      const baseUrl = 'http://localhost:4000';

      await agent.fetch(`${baseUrl}/land`);
      await agent.fetch(`${baseUrl}/signin`, { method: 'POST' });
      const response = await agent.fetch(`${baseUrl}/sync`, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`POST /sync failed with status: ${response.status}`);
      }

      return agent.getCookies();
    }

    beforeEach(() => {
      sessionsWithGetUser = Sessions({
        ...config,
        redisClient: client,
        interfaces: {
          getUser: (query, cb) => {
            cb(null, { ...getUserResult, culture });
          },
        },
      });
    });

    afterEach(async () => {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    it('updates session with data fetched from getUser interface', async () => {
      server = helpers.launchTestApp({
        use: sessionsWithGetUser.mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };

            next();
          },
          sessionsWithGetUser.mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'post:/sync': [
          (req, res, next) => {
            culture = 'en';

            next();
          },
          sessionsWithGetUser.mw.sync(),
          (req, res) => {
            res.send('ok');
          },
        ],
      });

      const cookies = await _runClientSyncRoutine();
      const sessionCookie = cookies[config.sessionCookie.name];
      const dc = Buffer.from(sessionCookie, 'base64').toString();

      expect(JSON.parse(dc).user.culture).toBe('en');
    });
  });

  describe('.open', () => {
    let sessions;
    let mw;
    let server;

    async function _runClientOpenRoutine() {
      const agent = createFetchAgent();
      const baseUrl = 'http://localhost:4000';

      await agent.fetch(`${baseUrl}/land`);
      await agent.fetch(`${baseUrl}/signin`, { method: 'POST' });
      const response = await agent.fetch(`${baseUrl}/cookied`);

      if (!response.ok) {
        throw new Error(`GET /cookied failed with status: ${response.status}`);
      }

      return agent.getCookies();
    }

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    afterEach(async () => {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    it('a session can be opened using service.open', () =>
      new Promise((rs) => {
        server = helpers.launchTestApp({
          use: mw,
          'get:/land': helpers.roundTrip,
          'post:/signin': (req, res) => {
            sessions.open(req, { uid: 12345678 }, () => {
              res.send('ok');
            });
          },
          'get:/cookied': (req, res) => {
            sessions.get(req, (err, session) => {
              expect(_.omit(session, ['expires'])).toEqual({
                culture: 'fr',
                uid: 12345678,
                name: 'Gaetan Latouche',
                isNew: false,
                thumbnail: '//graph.facebook.com/100002280111541/picture',
                id: 1,
                email: 'gaetan@cibul.net',
                latestActivity: session.latestActivity,
                isBlacklisted: false,
                transverseApiAccess: false,
              });

              res.send('ok');
            });
          },
        });

        _runClientOpenRoutine().then(() => rs());
      }));

    it('.. or using the open middleware', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            // you know beforehand based on an email
            // or other who is trying to sign in.
            req.userIdentifier = { uid: 123 };

            next();
          },
          mw.open(), // <= this opens the logged user session
          (req, res) => {
            expect(req.result.success).toBe(true);

            // resut will contain result of session open operation
            expect(_.omit(req.result.cookieData, ['expires'])).toEqual({
              user: {
                culture: 'fr',
                uid: 123,
                name: 'Gaetan Latouche',
                thumbnail: '//graph.facebook.com/100002280111541/picture',
              },
              sessionId: expect.any(String),
            });

            res.send('ok');
          },
        ],
        'get:/cookied': (req, res, _next) => {
          sessions.get(req, (err, session) => {
            expect(_.omit(session, ['expires'])).toEqual({
              culture: 'fr',
              uid: 123,
              name: 'Gaetan Latouche',
              thumbnail: '//graph.facebook.com/100002280111541/picture',
              id: 1,
              isNew: false,
              email: 'gaetan@cibul.net',
              latestActivity: session.latestActivity,
              isBlacklisted: false,
              transverseApiAccess: false,
            });

            res.send('ok');
          });
        },
      });

      await _runClientOpenRoutine();
    });
  });

  describe('.ifLogged / .ifUnlogged', () => {
    let sessions;
    let mw;
    let server;

    async function _runClientIfLoggedRoutine(signin = false) {
      const agent = createFetchAgent();
      const baseUrl = 'http://localhost:4000';

      await agent.fetch(`${baseUrl}/land`);
      if (signin) {
        await agent.fetch(`${baseUrl}/signin`, { method: 'POST' });
      }
      const response = await agent.fetch(`${baseUrl}/any`, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`POST /any failed with status: ${response.status}`);
      }

      return response.json();
    }

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    beforeEach(() => helpers.clearRedis(config.redis, client));

    afterEach(async () => {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    it('.ifUnlogged calls given middleware if user is unlogged', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': helpers.roundTrip,
        'post:/any': [
          mw.ifUnlogged((req, res, _next) => {
            res.send({ ladida: true });
          }),
          (req, res, _next) => {
            res.send({ ladida: false });
          },
        ],
      });

      const data = await _runClientIfLoggedRoutine(false);

      expect(data).toEqual({ ladida: true });
    });

    it('.ifUnlogged calls next if user is logged', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };
            next();
          },
          mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'post:/any': [
          mw.ifUnlogged((req, res, _next) => {
            res.send({ ladida: true });
          }),
          (req, res, _next) => {
            res.send({ ladida: false });
          },
        ],
      });

      const data = await _runClientIfLoggedRoutine(true);

      expect(data).toEqual({ ladida: false });
    });

    it('.ifLogged calls next if user is not logged', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': helpers.roundTrip,
        'post:/any': [
          mw.ifLogged((req, res, _next) => {
            res.send({ ladida: true });
          }),
          (req, res, _next) => {
            res.send({ ladida: false });
          },
        ],
      });

      const data = await _runClientIfLoggedRoutine(false);

      expect(data).toEqual({ ladida: false });
    });

    it('.ifLogged calls given middleware if user is logged', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };
            next();
          },
          mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'post:/any': [
          mw.ifLogged((req, res, _next) => {
            res.send({ ladida: true });
          }),
          (req, res, _next) => {
            res.send({ ladida: false });
          },
        ],
      });

      const data = await _runClientIfLoggedRoutine(true);

      expect(data).toEqual({ ladida: true });
    });
  });

  describe('.close', () => {
    let sessions;
    let mw;
    let server;

    async function _runClientCloseRoutine() {
      const agent = createFetchAgent();
      const baseUrl = 'http://localhost:4000';

      await agent.fetch(`${baseUrl}/land`);
      await agent.fetch(`${baseUrl}/signin`, { method: 'POST' });
      const response = await agent.fetch(`${baseUrl}/signout`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`POST /signout failed with status: ${response.status}`);
      }

      return response.text();
    }

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    afterEach(async () => {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    it('a session can be closed using service.close', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };
            next();
          },
          mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'post:/signout': (req, res, _next) => {
          sessions.close(req, (err, result) => {
            expect(result.success).toBe(true);

            expect(req.session).toEqual({ sessionId: expect.any(String) });

            res.send('ok');
          });
        },
      });

      await _runClientCloseRoutine();
    });

    it('.. or using the close middleware', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };
            next();
          },
          mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'post:/signout': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };
            next();
          },
          mw.close(),
          (req, res, _next) => {
            expect(req.result.success).toBe(true);

            expect(req.session).toEqual({ sessionId: expect.any(String) });

            res.send('ok');
          },
        ],
      });

      await _runClientCloseRoutine();
    });
  });

  describe('.load', () => {
    let sessions;
    let mw;
    let server;

    async function _runClientGetRoutine() {
      const agent = createFetchAgent();
      const baseUrl = 'http://localhost:4000';

      await agent.fetch(`${baseUrl}/land`);
      await agent.fetch(`${baseUrl}/signin`, { method: 'POST' });
      const response = await agent.fetch(`${baseUrl}/get`);

      if (!response.ok) {
        throw new Error(`GET /get failed with status: ${response.status}`);
      }

      return response.text();
    }

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    afterEach(async () => {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

    it('loads logged user cookie info in req.user', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };
            next();
          },
          mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'get:/get': [
          mw.load(),
          (req, res) => {
            expect(_.omit(req.user, ['expires'])).toEqual({
              culture: 'fr',
              uid: 123,
              name: 'Gaetan Latouche',
              thumbnail: '//graph.facebook.com/100002280111541/picture',
              id: 1,
              email: 'gaetan@cibul.net',
              isNew: false,
              latestActivity: req.user.latestActivity,
              isBlacklisted: false,
              transverseApiAccess: false,
            });

            res.send('ok');
          },
        ],
      });

      await _runClientGetRoutine();
    });

    it('loads all user info when detailed: true option is set', async () => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };
            next();
          },
          mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'get:/get': [
          mw.load({ detailed: true }),
          (req, res) => {
            expect(_.omit(req.user, ['latestActivity', 'expires'])).toEqual({
              id: 1,
              culture: 'fr',
              uid: 123,
              name: 'Gaetan Latouche',
              isNew: false,
              thumbnail: '//graph.facebook.com/100002280111541/picture',
              email: 'gaetan@cibul.net',
              isBlacklisted: false,
              transverseApiAccess: false,
            });

            res.send('ok');
          },
        ],
      });

      await _runClientGetRoutine();
    });
  });
});
