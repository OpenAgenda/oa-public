import Sessions from '../src/service/index.js';
import isoConfig from '../src/iso/config.js';
import config from '../testconfig.js';
import * as h from './lib/helpers.js';

describe('session - functional (server): close', () => {
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

  it('close ends the session using the request object', async () => {
    await new Promise((resolve, reject) => {
      sessions.open(request, { uid: 12345678 }, (err) => {
        if (err) return reject(err);

        sessions.close(request, (err1, result) => {
          if (err1) return reject(err1);

          expect(result.success).toBe(true);

          resolve();
        });
      });
    });
  });

  it('request session is nulled', async () => {
    await new Promise((resolve, reject) => {
      sessions.open(request, { uid: 12345678 }, (err) => {
        if (err) return reject(err);

        sessions.close(request, (err1, _result) => {
          if (err1) return reject(err1);

          expect(request.session).toEqual({ sessionId: expect.any(String) });

          resolve();
        });
      });
    });
  });

  it('redis store of session is emptied', async () => {
    await new Promise((resolve, reject) => {
      sessions.open(request, { uid: 12345678 }, (err) => {
        if (err) return reject(err);

        client.get([config.redis.prefix, 12345678].join(':')).then((result) => {
          expect(JSON.parse(result).email).toBe('gaetan@cibul.net');

          sessions.close(request, (err1) => {
            if (err1) return reject(err1);
            client
              .get([config.redis.prefix, 12345678].join(':'))
              .then((result1) => {
                expect(err).toBe(null);
                expect(result1).toBe(null);

                resolve();
              });
          });
        }, reject);
      });
    });
  });
});
