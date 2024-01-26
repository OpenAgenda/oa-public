'use strict';

const _ = require('lodash');
const sa = require('superagent');
const base64 = require('@openagenda/utils/base64');
const config = require('../testconfig');
const Sessions = require('../src/service');
const helpers = require('./lib/helpers');

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

    afterEach(done => server.close(done.bind(null)));

    it('updates session with data fetched from getUser interface', done => {
      server = helpers.launchTestApp({
        use: sessionsWithGetUser.mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => {
            req.userIdentifier = { uid: 123 };

            next();
          },
          sessionsWithGetUser.mw.open(),
          (req, res) => { res.send('ok'); },
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

      _runClientSyncRoutine().then(res => {
        const dc = base64.decode(res.header['set-cookie'][0].split('=')[1].split(';')[0]).replace(String.fromCharCode(0), '');
        expect(
          JSON.parse(dc).user.culture,
        ).toBe('en');

        done();
      });
    });

    function _runClientSyncRoutine() {
      const agent = sa.agent();

      return agent.get('http://localhost:3000/land')

        .then(() => agent.post('http://localhost:3000/signin'))

        .then(() => agent.post('http://localhost:3000/sync'));
    }
  });

  describe('.open', () => {
    let sessions;
    let mw;
    let server;

    function _runClientOpenRoutine() {
      const agent = sa.agent();

      return agent.get('http://localhost:3000/land')

        .then(() => agent.post('http://localhost:3000/signin'))

        .then(() => agent.get('http://localhost:3000/cookied'));
    }

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    afterEach(done => server.close(done.bind(null)));

    it('a session can be opened using service.open', () => new Promise(rs => {
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
            expect(
              _.omit(session, ['expires']),
            ).toEqual({
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

    it('.. or using the open middleware', done => {
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
            expect(
              _.omit(req.result.cookieData, ['expires']),
            ).toEqual({
              user: {
                culture: 'fr',
                uid: 123,
                name: 'Gaetan Latouche',
                thumbnail: '//graph.facebook.com/100002280111541/picture',
              },
            });

            res.send('ok');
          },
        ],
        'get:/cookied': (req, res, next) => {
          sessions.get(req, (err, session) => {
            expect(
              _.omit(session, ['expires']),
            ).toEqual({
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

      _runClientOpenRoutine().then(res => done());
    });
  });

  describe('.ifLogged / .ifUnlogged', () => {
    let sessions;
    let mw;
    let server;

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    beforeEach(() => helpers.clearRedis(config.redis, client));

    afterEach(done => server.close(done.bind(null)));

    it('.ifUnlogged calls given middleware if user is unlogged', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': helpers.roundTrip,
        'post:/any': [
          mw.ifUnlogged((req, res, next) => {
            res.send({ ladida: true });
          }),
          (req, res, next) => { res.send({ ladida: false }); },
        ],
      });

      _runClientIfLoggedRoutine(false).then(res => {
        expect(res.body).toEqual({ ladida: true });

        done();
      });
    });

    it('.ifUnlogged calls next if user is logged', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          (req, res) => { res.send('ok'); },
        ],
        'post:/any': [
          mw.ifUnlogged((req, res, next) => {
            res.send({ ladida: true });
          }),
          (req, res, next) => { res.send({ ladida: false }); },
        ],
      });

      _runClientIfLoggedRoutine(true).then(res => {
        expect(res.body).toEqual({ ladida: false });

        done();
      });
    });

    it('.ifLogged calls next if user is not logged', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': helpers.roundTrip,
        'post:/any': [
          mw.ifLogged((req, res, next) => {
            res.send({ ladida: true });
          }),
          (req, res, next) => { res.send({ ladida: false }); },
        ],
      });

      _runClientIfLoggedRoutine(false).then(res => {
        expect(res.body).toEqual({ ladida: false });

        done();
      });
    });

    it('.ifLogged calls given middleware if user is logged', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          (req, res) => { res.send('ok'); },
        ],
        'post:/any': [
          mw.ifLogged((req, res, next) => {
            res.send({ ladida: true });
          }),
          (req, res, next) => { res.send({ ladida: false }); },
        ],
      });

      _runClientIfLoggedRoutine(true).then(res => {
        expect(res.body).toEqual({ ladida: true });

        done();
      });
    });

    function _runClientIfLoggedRoutine(signin = false) {
      const agent = sa.agent();

      return agent.get('http://localhost:3000/land')

        .then(() => (signin ? agent.post('http://localhost:3000/signin') : () => {}))

        .then(() => agent.post('http://localhost:3000/any'));
    }
  });

  describe('.close', () => {
    let sessions;
    let mw;
    let server;

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    afterEach(done => server.close(done.bind(null)));

    it('a session can be closed using service.close', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          (req, res) => { res.send('ok'); },
        ],
        'post:/signout': (req, res, next) => {
          sessions.close(req, (err, result) => {
            expect(result.success).toBe(true);

            expect(req.session).toBeNull();

            res.send('ok');
          });
        },
      });

      _runClientCloseRoutine().then(res => { done(); });
    });

    it('.. or using the close middleware', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          (req, res) => { res.send('ok'); },
        ],
        'post:/signout': [
          (req, res, next) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.close(),
          (req, res, next) => {
            expect(req.result.success).toBe(true);

            expect(req.session).toBeNull();

            res.send('ok');
          },
        ],
      });

      _runClientCloseRoutine().then(res => { done(); });
    });

    function _runClientCloseRoutine() {
      const agent = sa.agent();

      return agent.get('http://localhost:3000/land')

        .then(() => agent.post('http://localhost:3000/signin'))

        .then(() => agent.post('http://localhost:3000/signout'));
    }
  });

  describe('.load', () => {
    let sessions;
    let mw;
    let server;

    beforeAll(() => {
      sessions = Sessions({
        ...config,
        redisClient: client,
      });

      mw = sessions.mw;
    });

    afterEach(done => server.close(done.bind(null)));

    it('loads logged user cookie info in req.user', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          (req, res) => { res.send('ok'); },
        ],
        'get:/get': [
          mw.load(),
          (req, res) => {
            expect(
              _.omit(req.user, ['expires']),
            ).toEqual({
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

      _runClientGetRoutine().then(res => { done(); });
    });

    it('loads all user info when detailed: true option is set', done => {
      server = helpers.launchTestApp({
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin': [
          (req, res, next) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          (req, res) => {
            res.send('ok');
          },
        ],
        'get:/get': [
          mw.load({ detailed: true }),
          (req, res) => {
            expect(
              _.omit(req.user, ['latestActivity', 'expires']),
            ).toEqual({
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

      _runClientGetRoutine().then(res => { done(); });
    });

    function _runClientGetRoutine() {
      const agent = sa.agent();

      return agent.get('http://localhost:3000/land')

        .then(() => agent.post('http://localhost:3000/signin'))

        .then(() => agent.get('http://localhost:3000/get'));
    }
  });
});
