import Sessions from '../src/service/index.js';
import isoConfig from '../src/iso/config.js';
import config from '../testconfig.js';
import * as h from './lib/helpers.js';

describe('session - functional (server): scan', () => {
  let client;
  let request;
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
    request = {
      cookies: {},
      session: {},
    };

    request.cookies[isoConfig.cookies.session] = 'therandomsessioncode';
  });

  beforeEach(async () => {
    function asyncOpen(...args) {
      return new Promise((resolve, reject) => {
        sessions.open(...args, (err) => {
          if (err) return reject(err);
          return resolve();
        });
      });
    }

    for (let i = 0; i < 10; i++) {
      await asyncOpen(request, { uid: i });
    }
  });

  afterAll(() => client.quit());

  it('scans through open sessions', () =>
    new Promise((rs, rj) => {
      sessions.scan(0, 2, (err, existingSessions, nextCursor) => {
        try {
          expect(err).toBeNull();

          expect(nextCursor).not.toBe(0);

          expect(existingSessions.length).toBeGreaterThanOrEqual(2);

          rs();
        } catch (e) {
          return rj(e);
        }
      });
    }));

  it('default fetch count is 10', () =>
    new Promise((rs) => {
      sessions.scan(0, (err, _sessions, _nextCursor) => {
        expect(err).toBeNull();

        rs();
      });
    }));

  it('nextCursor is 0 when end of scan is reached', () =>
    new Promise((rs) => {
      sessions.scan(6, 10, (err, _sessions, cursor) => {
        expect(cursor).toBe(0);

        rs();
      });
    }));
});
