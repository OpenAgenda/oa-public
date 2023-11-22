"use strict";

const _ = require( 'lodash' );

const Sessions = require( '../src/service' );
const isoConfig = require( '../src/iso/config' );
const config = require( '../testconfig' );
const h = require( './lib/helpers' );

describe( 'session - functional (server): sync', () => {
  let client;
  let request;
  let sessions;

  beforeAll(async () => {
    client = await h.createClient(config.redis);
  });

  beforeEach(() => h.clearRedis(config.redis, client));

  beforeAll( () => {
    sessions = Sessions({
      ...config,
      redisClient: client,
    });
  });

  beforeEach(() => {
    request = {
      cookies: {},
      session: {}
    };

    request.cookies[isoConfig.cookies.session] = 'therandomsessioncode';
  });

  afterAll(() => client.quit());

  it( 'sync is used only when a session is open', done => {

    sessions.sync( request, ( err, result ) => {

      expect(result.success).toBe(false);

      done();

    } );

  } );

  it( 'sync updates session with data fetched from getUser interface', done => {

    const getUserResult = {
      id: 1,
      uid: 1234,
      email: 'blorg@cibul.net',
      culture: 'fr',
      name: 'Gaetanne',
      thumbnail: null
    };

    const sessionsWithDifferentGetUser = Sessions({
      ...config,
      redisClient: client,
      interfaces: {
        getUser: (query, cb) => cb(null, getUserResult)
      }
    });

    sessionsWithDifferentGetUser.open( request, { uid: 1234 }, (err, result) => {
      expect(result.data.culture).toBe('fr');

      getUserResult.culture = 'en';

      sessionsWithDifferentGetUser.sync(request, ( err, result ) => {
        expect(result.success).toBe(true);
        expect(result.data.culture).toBe('en');

        done();
      });
    });

  } );

} );