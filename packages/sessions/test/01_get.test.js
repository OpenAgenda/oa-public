"use strict";

const _ = require( 'lodash' );
const Sessions = require( '../src/service' );
const isoConfig = require( '../src/iso/config' );
const config = require( '../testconfig' );
const h = require( './lib/helpers' );

describe( 'session - functional (server): get', () => {
  let client;
  let request;
  let sessions;

  beforeAll(async () => {
    client = await h.createClient(config.redis);
  });

  beforeAll( () => {
    sessions = Sessions({
      ...config,
      redisClient: client,
    });
  });
  
  beforeAll( () => {
    request = { cookies: {}, session: {} };

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';
  } );

  beforeEach(() => h.clearRedis(config.redis, client));
  
  afterAll(() => client.quit());

  it( 'get takes request and calls back with session data', done => {

    sessions.open( request, { uid: 1234 }, ( err, result ) => {

      sessions.get( request, ( err, session ) => {

        expect(err).toBeNull();
        expect(Object.keys( session )).toEqual([
          'culture',
          'uid',
          'name',
          'thumbnail',
          'id',
          'email',
          'latestActivity',
          'expires',
          'isNew',
          'isBlacklisted'
        ]);

        expect(
          _.omit( session, [ 'latestActivity', 'expires' ] )
        ).toEqual({
          id: 1,
          uid: 1234,
          email: 'gaetan@cibul.net',
          culture: 'fr',
          isNew: false,
          name: 'Gaetan Latouche',
          thumbnail: '//graph.facebook.com/100002280111541/picture',
          isBlacklisted: false
        });

        done();

      } );

    } );

  } );

  it( 'get takes uid and calls back with session data', done => {

    sessions.open( request, { uid: 12345678 }, () => {

      sessions.get( 12345678, ( err, session ) => {

        expect(err).toBeNull();

        expect(
          _.omit( session, [ 'latestActivity', 'expires' ] )
        ).toEqual({
          id: 1,
          email: 'gaetan@cibul.net',
          uid: 12345678,
          isNew: false,
          isBlacklisted: false,
          culture: 'fr',
          name: 'Gaetan Latouche',
          thumbnail: '//graph.facebook.com/100002280111541/picture'
        });

        done();

      } );

    } );

  } );

  it( 'get for an unset session gives back null', done => {

    sessions.get( 12345678, ( err, session ) => {

      expect(err).toBeNull();
      expect(session).toBeNull();

      done();

    } );

  } );

} )
