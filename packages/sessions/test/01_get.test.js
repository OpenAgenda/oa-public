import _ from 'lodash';
import Sessions from '../src/service/index.js';
import isoConfig from '../src/iso/config.js';
import config from '../testconfig.js';
import * as h from './lib/helpers.js';

describe('session - functional (server): get', () => {
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

  beforeAll(() => {
    request = { cookies: {}, session: {} };

    request.cookies[isoConfig.cookies.session] = 'therandomsessioncode';
  });

  beforeEach(() => h.clearRedis(config.redis, client));

  afterAll(() => client.quit());

  it('get takes request and calls back with session data', async () => {
    await new Promise((resolve, reject) => {
      sessions.open(request, { uid: 1234 }, (err, _result) => {
        if (err) return reject(err);

        sessions.get(request, (err1, session) => {
          if (err1) return reject(err1);

          expect(Object.keys(session)).toEqual([
            'culture',
            'uid',
            'name',
            'thumbnail',
            'id',
            'email',
            'latestActivity',
            'expires',
            'isNew',
            'isBlacklisted',
            'transverseApiAccess',
          ]);

          expect(_.omit(session, ['latestActivity', 'expires'])).toEqual({
            id: 1,
            uid: 1234,
            email: 'gaetan@cibul.net',
            culture: 'fr',
            isNew: false,
            name: 'Gaetan Latouche',
            thumbnail: '//graph.facebook.com/100002280111541/picture',
            isBlacklisted: false,
            transverseApiAccess: false,
          });

          resolve();
        });
      });
    });
  });

  it('get takes uid and calls back with session data', async () => {
    await new Promise((resolve, reject) => {
      sessions.open(request, { uid: 12345678 }, (err) => {
        if (err) return reject(err);

        sessions.get(12345678, (err1, session) => {
          if (err1) return reject(err1);

          expect(_.omit(session, ['latestActivity', 'expires'])).toEqual({
            id: 1,
            email: 'gaetan@cibul.net',
            uid: 12345678,
            isNew: false,
            isBlacklisted: false,
            culture: 'fr',
            name: 'Gaetan Latouche',
            thumbnail: '//graph.facebook.com/100002280111541/picture',
            transverseApiAccess: false,
          });

          resolve();
        });
      });
    });
  });

  it('get for an unset session gives back null', async () => {
    await new Promise((resolve) => {
      sessions.get(12345678, (err, session) => {
        expect(err).toBeNull();
        expect(session).toBeNull();

        resolve();
      });
    });
  });
});
