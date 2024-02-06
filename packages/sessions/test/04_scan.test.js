'use strict';

const Sessions = require('../src/service');
const isoConfig = require('../src/iso/config');
const config = require('../testconfig');
const h = require('./lib/helpers');

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
    let i = 0;

    while (i < 10) {
      await new Promise((resolve, reject) => {
        sessions.open(request, { uid: i }, (err) => {
          if (err) reject(err);
          else {
            i += 1;
            resolve();
          }
        });
      });
    }
  });

  afterAll(() => client.quit());

  it('scans through open sessions', () => new Promise((rs, rj) => {
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

  it('default fetch count is 10', () => new Promise(rs => {
    sessions.scan(0, (err, _sessions, _nextCursor) => {
      expect(err).toBeNull();

      rs();
    });
  }));

  it('nextCursor is 0 when end of scan is reached', () => new Promise(rs => {
    sessions.scan(6, 10, (err, _sessions, cursor) => {
      expect(cursor).toBe(0);

      rs();
    });
  }));
});
