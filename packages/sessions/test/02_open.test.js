import _ from 'lodash';
import Sessions from '../src/service/index.js';
import isoConfig from '../src/iso/config.js';
import config from '../testconfig.js';
import * as h from './lib/helpers.js';

describe('session - functional (server): open', () => {
  let client;
  let request;
  let response;
  let sessions;

  beforeAll(async () => {
    client = await h.createClient(config.redis);
  });

  beforeAll(() => {
    sessions = Sessions({
      ...config,
      redisClient: client,
    });
  });

  beforeEach(() => h.clearRedis(config.redis, client));

  beforeEach(() => {
    request = { cookies: {}, session: {} };

    response = {
      writable: {},
      cookie(name, value) {
        this.writable[name] = value;
      },
    };

    request.cookies[isoConfig.cookies.session] = 'therandomsessioncode';
  });

  afterAll(() => client.quit());

  it('open a session by providing a request object and a user identifier', () =>
    new Promise((rs) => {
      sessions.open(request, { uid: 123 }, (err, result) => {
        expect(err).toBeNull();
        expect(result.success).toBe(true);
        expect(Object.keys(result)).toEqual([
          'success', // true if ok
          'data', // session data stored on the server side
          'cookieData', // session data stored on the session cookie
          'errors', // list of errors in case success was false
        ]);

        rs();
      });
    }));

  it('open stores complete session data in redis', () =>
    new Promise((rs) => {
      sessions.open(request, { uid: 12345678 }, () => {
        client.get([config.redis.prefix, 12345678].join(':')).then((result) => {
          const parsed = JSON.parse(result);

          expect(Object.keys(parsed)).toEqual([
            'id',
            'email',
            'latestActivity',
            'expires',
            'isNew',
            'isBlacklisted',
            'transverseApiAccess',
            'culture',
            'uid',
            'name',
            'thumbnail',
          ]);

          rs();
        });
      });
    }));

  it('open updates given request object with cookie session information', () =>
    new Promise((rs) => {
      expect(request.session).toEqual({});

      sessions.open(request, { uid: 12345678 }, (err, _result) => {
        expect(err).toBeNull();
        expect(_.omit(request.session, ['expires'])).toEqual({
          user: {
            culture: 'fr',
            uid: 12345678,
            name: 'Gaetan Latouche',
            thumbnail: '//graph.facebook.com/100002280111541/picture',
          },
          sessionId: expect.any(String),
        });

        rs();
      });
    }));

  it('open uses identifier data on getUser interface to retrieve user data details', () =>
    new Promise((rs) => {
      const sessionWithSpecificGetUser = Sessions({
        ...config,
        redisClient: client,
        interfaces: {
          getUser: (query, cb) => {
            cb(null, {
              id: 1,
              uid: 1234,
              email: 'zorglub@cibul.net',
              culture: 'fr',
              name: 'Gaetan Latouche',
              thumbnail: '//graph.facebook.com/100002280111541/picture',
            });
          },
        },
      });

      sessionWithSpecificGetUser.open(
        request,
        { uid: 1234 },
        (_err, result) => {
          expect(result.data.uid).toBe(1234);

          rs();
        },
      );
    }));

  it('open sets an expiration on session', () =>
    new Promise((rs) => {
      const sessionsWithSmallExpire = Sessions({
        ...config,
        expire: 1,
        redisClient: client,
      });

      sessionsWithSmallExpire.open(request, { uid: 1234 }, () => {
        sessionsWithSmallExpire.get(request, (_err, user1) => {
          expect(user1).not.toBeNull();

          setTimeout(() => {
            sessionsWithSmallExpire.get(request, (_err2, user2) => {
              expect(user2).toBeNull();

              rs();
            });
          }, 1500);
        });
      });
    }));

  it('if given a response object, open clears writable cookie', () =>
    new Promise((rs) => {
      sessions.open(request, response, { uid: 1234 }, () => {
        expect(
          Buffer.from(
            response.writable[config.writableCookie.name],
            'base64',
          ).toString('utf-8'),
        ).toBe('{}');

        rs();
      });
    }));
});
