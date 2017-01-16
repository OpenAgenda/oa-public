"use strict";

const sessions = require( '../' );
const should = require( 'should' );
const config = require( '../testconfig' );
const isoConfig = require( '../iso/config' );
const h = require( './lib/helpers' );
const extend = require( 'lodash/extend' );
const _ = require( 'lodash' );

h.init( config );

describe( 'session - functional (server): open, close, get & update', () => {

  let request;

  before( h.clearRedis );

  beforeEach( () => sessions.init( config ) );

  beforeEach( () => {

    request = { cookies: {}, session: {} };

    request.cookies[ isoConfig.cookie ] = 'therandomsessioncode';

  } );

  describe( '.open', () => {

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

        h.redisGet( config.redis.prefix + 'therandomsessioncode', ( err, result ) => {

          let parsed = JSON.parse( result );

          parsed.code.should.equal( 'therandomsessioncode' );

          Object.keys( parsed ).should.eql( [ 'code', 'id', 'email', 'latestActivity', 'culture', 'uid', 'name', 'thumbnail' ] );

          done();

        } );

      } );

    } );

    it( 'open updates given request object with cookie session information', done => {

      request.session.should.eql( {} );

      sessions.open( request, { uid: 12345678 }, ( err, result ) => {

        request.session.should.eql( {
          flash: null,
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

      sessions.init( extend( {}, config, {
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

  } );

  describe( '.get', () => {

    it( 'get takes request and calls back with session data', done => {

      sessions.open( request, { uid: 1234 }, () => {

        sessions.get( request, ( err, session ) => {

          should( err ).equal( null );

          Object.keys( session ).should.eql( [
            'code',
            'id',
            'email',
            'latestActivity',
            'culture',
            'uid',
            'name', 
            'thumbnail'
          ] );

          _.omit( session, [ 'latestActivity' ] )

          .should.eql( {
            code: 'therandomsessioncode',
            id: 1,
            uid: 12345678,
            email: 'gaetan@cibul.net',
            culture: 'fr',
            name: 'Gaetan Latouche',
            thumbnail: '//graph.facebook.com/100002280111541/picture'
          } );

          done();

        } );

      } );

    } );

    it( 'get takes code and calls back with session data', done => {

      sessions.open( request, { uid: 1234 }, () => {

        sessions.get( 'therandomsessioncode', ( err, session ) => {

          should( err ).equal( null );

          _.omit( session, [ 'latestActivity' ] )

          .should.eql( {
            code: 'therandomsessioncode',
            id: 1,
            uid: 12345678,
            email: 'gaetan@cibul.net',
            culture: 'fr' ,
            name: 'Gaetan Latouche',
            thumbnail: '//graph.facebook.com/100002280111541/picture'
          } );

          done();

        } );

      } );

    } );

  } );

  describe( '.close', () => {

    it( 'close ends the session using the request object', done => {

      sessions.open( request, { uid: 12345678 }, ( err, result ) => {

        sessions.close( request, ( err, result ) => {

          result.success.should.equal( true );

          done();

        } );

      } );

    } );

    it( 'request session is nulled', done => {

      sessions.open( request, { uid: 12345678 }, ( err, result ) => {

        sessions.close( request, ( err, result ) => {

          should( request.session ).equal( null );          

          done();

        } );

      } );

    } );

    it( 'redis store of session is emptied', done => {

      sessions.open( request, { uid: 12345678 }, ( err, result ) => {

        sessions.close( request, ( err, result ) => {

          h.redisGet( config.redis.prefix + 'therandomsessioncode', ( err, result ) => {

            should( err ).equal( null );
            should( result ).equal( null );

            done();

          } );

        } );

      } );

    } );

  } );

} ); 