"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );

const should = require( 'should' );
const ih = require( 'immutability-helper' );
const sessions = require( '../src/service' );
const isoConfig = require( '../src/iso/config' );
const config = require( '../testconfig' );
const h = require( './lib/helpers' );

describe( 'session - functional (server): open', () => {
  let client;
  let request;
  let response;

  beforeEach(async () => {
    client = await h.createClient(config.redis);
  });


  beforeEach(() => h.clearRedis(config.redis, client));

  beforeEach( () => sessions.init({
    ...config,
    redisClient: client,
  }));

  beforeEach( () => {

    request = { cookies: {}, session: {} };

    response = {
      writable: {},
      cookie: function( name, value ) { this.writable[ name ] = value; }
    }

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

  } );

  afterEach(() => client.quit());

  it( 'open a session by providing a request object and a user identifier', done => {

    sessions.open( request, { uid: 123 }, ( err, result ) => {

      result.success.should.equal( true );

      Object.keys( result ).should.eql( [
        'success', // true if ok
        'data', // session data stored on the server side
        'cookieData', // session data stored on the session cookie
        'errors' // list of errors in case success was false
      ] );

      done();

    } );

  } );

  it( 'open stores complete session data in redis', done => {

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      client.get([config.redis.prefix, 12345678].join(':')).then(result => {
        let parsed = JSON.parse( result );

        Object.keys( parsed ).should.eql( [ 'id', 'email', 'latestActivity', 'expires', 'isNew', 'isBlacklisted', 'culture', 'uid', 'name', 'thumbnail' ] );

        done();
      } );
    } );

  } );

  it( 'open updates given request object with cookie sqession information', done => {

    request.session.should.eql( {} );

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      _.omit(request.session, ['expires']).should.eql( {
        user: {
          culture: 'fr',
          uid: 12345678,
          name: 'Gaetan Latouche',
          thumbnail: '//graph.facebook.com/100002280111541/picture'
        }
      } );

      done();

    } )

  } );

  it( 'open uses identifier data on getUser interface to retrieve user data details', done => {

    sessions.init( _.extend( {}, config, {
      interfaces: {
        getUser: ( query, cb ) => {

          cb( null, {
            id: 1,
            uid: 1234,
            email: 'zorglub@cibul.net',
            culture: 'fr',
            name: 'Gaetan Latouche',
            thumbnail: '//graph.facebook.com/100002280111541/picture'
          } );

        }
      }
    } ) );

    sessions.open( request, { uid: 1234 }, ( err, result ) => {

      result.data.uid.should.equal( 1234 );

      done();

    } );

  } );

  it( 'open sets an expiration on session', done => {

    sessions.init( ih( config, {
      expire: {
        $set: 1
      }
    } ) );

    sessions.open( request, { uid: 1234 }, ( err, result ) => {

      sessions.get( request, ( err, user ) => {

        should( user ).not.equal( null );

        setTimeout( () => {

          sessions.get( request, ( err, user ) => {

            should( user ).equal( null );

            done();

          } );

        }, 1500 );

      } );

    } );

  } );


  it( 'if given a response object, open clears writable cookie', done => {

    sessions.open( request, response, { uid: 1234 }, ( err, result ) => {

      Buffer.from( response.writable[ config.writableCookie.name ], 'base64' ).toString( 'utf-8' ).should.equal( '{}' );

      done();

    } );


  } )

} );
