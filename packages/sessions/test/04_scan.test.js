"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const Sessions = require( '../src/service' );
const isoConfig = require( '../src/iso/config' );
const config = require( '../testconfig' );
const h = require( './lib/helpers' );

describe( 'session - functional (server): scan', () => {
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

  beforeEach(() => h.clearRedis(config.redis, client));

  beforeEach(() => {
    request = {
      cookies: {},
      session: {}
    };

    request.cookies[isoConfig.cookies.session] = 'therandomsessioncode';
  });

  beforeEach( done => {

    let i = 0;

    async.whilst( () => i < 10, wcb => {

      sessions.open( request, { uid: i }, ( err, result ) => {

        i++;

        wcb();
        
      } );
      
    }, err => { done(); } );
    
  } );
  
  afterAll(() => client.quit());

  it( 'scans through open sessions', done => {

    sessions.scan( 0, 2, ( err, sessions, nextCursor ) => {
      try {

        expect( err ).toBeNull();

        expect(nextCursor).not.toBe(0);

        expect( sessions.length ).toBeGreaterThanOrEqual(2);

        done();        

      } catch( e ) { 

        return done( e );

      }

    } );

  } );


  it( 'default fetch count is 10', done => {

    sessions.scan( 0, ( err, sessions, nextCursor ) => {

      expect(err).toBeNull();

      done();

    } );

  } );


  it( 'nextCursor is 0 when end of scan is reached', done => {

    sessions.scan( 6, 10, ( err, sessions, cursor ) => {

      expect(cursor).toBe(0);

      done();

    } );

  } );

} );