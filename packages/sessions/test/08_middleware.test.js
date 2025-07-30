import _ from 'lodash';
import sa from 'superagent';
import base64 from '@openagenda/utils/base64.js';
import config from '../testconfig.js';
import Sessions from '../src/service/index.js';
import * as helpers from './lib/helpers.js';

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

    function _runClientSyncRoutine() {
      const agent = sa.agent();

      return agent
        .get('http://localhost:4000/land')
        .then(() => agent.post('http://localhost:4000/signin'))
        .then(() => agent.post('http://localhost:4000/sync'));
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

      const res = await _runClientSyncRoutine();
      const dc = base64
        .decode(res.header['set-cookie'][0].split('=')[1].split(';')[0])
        .replace(String.fromCharCode(0), '');

      expect(JSON.parse(dc).user.culture).toBe('en');
    });
  });

  describe('.open', () => {
    let sessions;
    let mw;
    let server;

    function _runClientOpenRoutine() {
      const agent = sa.agent();

      return agent
        .get('http://localhost:4000/land')
        .then(() => agent.post('http://localhost:4000/signin'))
        .then(() => agent.get('http://localhost:4000/cookied'));
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

    function _runClientIfLoggedRoutine(signin = false) {
      const agent = sa.agent();

      return agent
        .get('http://localhost:4000/land')
        .then(() =>
          (signin ? agent.post('http://localhost:4000/signin') : () => {}))
        .then(() => agent.post('http://localhost:4000/any'));
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

      const res = await _runClientIfLoggedRoutine(false);

      expect(res.body).toEqual({ ladida: true });
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

      const res = await _runClientIfLoggedRoutine(true);

      expect(res.body).toEqual({ ladida: false });
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

      const res = await _runClientIfLoggedRoutine(false);

      expect(res.body).toEqual({ ladida: false });
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

      const res = await _runClientIfLoggedRoutine(true);

      expect(res.body).toEqual({ ladida: true });
    });
  });

  describe('.close', () => {
    let sessions;
    let mw;
    let server;

    function _runClientCloseRoutine() {
      const agent = sa.agent();

      return agent
        .get('http://localhost:4000/land')
        .then(() => agent.post('http://localhost:4000/signin'))
        .then(() => agent.post('http://localhost:4000/signout'));
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

    function _runClientGetRoutine() {
      const agent = sa.agent();

      return agent
        .get('http://localhost:4000/land')
        .then(() => agent.post('http://localhost:4000/signin'))
        .then(() => agent.get('http://localhost:4000/get'));
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
