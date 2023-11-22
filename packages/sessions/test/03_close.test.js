"use strict";

const _ = require( 'lodash' );

const Sessions = require( '../src/service' );
const isoConfig = require( '../src/iso/config' );
const config = require( '../testconfig' );
const h = require( './lib/helpers' );

const users = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/lib/users.json', 'utf-8' ) );

describe( 'session - functional (server): close', () => {
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

  it( 'close ends the session using the request object', done => {

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      sessions.close( request, ( err, result ) => {

        expect(result.success).toBe(true);

        done();

      } );

    } );

  } );

  it( 'request session is nulled', done => {

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      sessions.close( request, ( err, result ) => {

        expect(request.session).toBe(null);

        done();

      } );

    } );

  } );

  it( 'redis store of session is emptied', done => {

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      client.get([config.redis.prefix, 12345678].join(':')).then(result => {

        expect(
          JSON.parse( result ).email
        ).toBe( 'gaetan@cibul.net' );

        sessions.close( request, ( err, result ) => {

          client.get([config.redis.prefix, 12345678].join(':')).then(result => {

            expect(err).toBe(null);
            expect(result).toBe(null);

            done();

          } );

        } );

      } );

    } );

  } );

} );