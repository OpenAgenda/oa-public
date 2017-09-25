"use strict";

process.env.NODE_ENV = 'test';

const sessions = require( '../' );
const should = require( 'should' );
const config = require( '../testconfig' );
const isoConfig = require( '../iso/config' );
const h = require( './lib/helpers' );
const _ = require( 'lodash' );
const async = require( 'async' );
const ih = require( 'immutability-helper' );

const users = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/lib/users.json', 'utf-8' ) );

describe( 'session - functional (server): open', () => {

  h.init( config );

  let request, response;

  beforeEach( h.clearRedis );

  beforeEach( () => sessions.init( config ) );

  afterEach( () => sessions.shutdown() );

  beforeEach( () => {

    request = { cookies: {}, session: {} };

    response = {
      writable: {},
      cookie: function( name, value ) { this.writable[ name ] = value; }
    }

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

  } );

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

      h.redisGet( [ config.redis.prefix, 12345678 ].join( ':' ), ( err, result ) => {

        let parsed = JSON.parse( result );

        Object.keys( parsed ).should.eql( [ 'id', 'email', 'latestActivity', 'isNew', 'culture', 'uid', 'name', 'thumbnail' ] );

        done();

      } );

    } );

  } );

  it( 'open updates given request object with cookie session information', done => {

    request.session.should.eql( {} );

    sessions.open( request, { uid: 12345678 }, ( err, result ) => {

      request.session.should.eql( {
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

      ( new Buffer( response.writable[ config.writableCookie.name ], 'base64' ) ).toString( 'utf-8' ).should.equal( '{}' );

      done();

    } );


  } )

} );