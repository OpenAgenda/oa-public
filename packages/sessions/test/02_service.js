"use strict";

const sessions = require( '../' );
const should = require( 'should' );
const config = require( '../testconfig' );
const isoConfig = require( '../iso/config' );
const h = require( './lib/helpers' );
const extend = require( 'lodash/extend' );
const _ = require( 'lodash' );
const async = require( 'async' );

const users = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/lib/users.json', 'utf-8' ) );

h.init( config );

describe( 'session - functional (server): open, close, get & update', () => {

  let request;

  beforeEach( h.clearRedis );

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

        h.redisHGet( config.redis.hash, 12345678, ( err, result ) => {

          let parsed = JSON.parse( result );

          Object.keys( parsed ).should.eql( [ 'id', 'email', 'latestActivity', 'culture', 'uid', 'name', 'thumbnail' ] );

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


  describe( '.scan', () => {

    beforeEach( h.clearRedis );

    beforeEach( () => {

      sessions.init( extend( {}, config, {
        interfaces: {
          getUser: ( query, cb ) => {

            cb( null, users[ query.uid ] );

          }
        }
      } ) );

    } );

    beforeEach( done => {

      let i = 0;

      async.whilst( () => i < 10, wcb => {

        sessions.open( request, { uid: i }, ( err, result ) => {

          i++;

          wcb();

        } );

      }, err => { done(); } );

    } );

    it( 'scans through open sessions', done => {

      sessions.scan( 0, 5, ( err, sessions, nextCursor ) => {

        should( err ).equal( null );

        nextCursor.should.not.equal( 0 );

        sessions.length.should.not.equal( 0 );

        done();

      } );

    } );

    it( 'default fetch count is 10', done => {

      sessions.scan( 0, ( err, sessions, nextCursor ) => {

        should( err ).equal( null );

        done();

      } );

    } );

    it( 'nextCursor is 0 when end of scan is reached', done => {

      sessions.scan( 6, 10, ( err, sessions, cursor ) => {

        cursor.should.equal( 0 );

        done();

      } );

    } );

  } );


  describe( '.sync', () => {

    it( 'sync is used only when a session is open', done => {

      sessions.sync( request, ( err, result ) => {

        result.success.should.equal( false );

        done();

      } );

    } );

    it( 'sync updates session with data fetched from getUser interface', done => {

      sessions.open( request, { uid: 1234 }, () => {

        // the data fetched from getUser changes a bit
        sessions.init( extend( {}, config, {
          interfaces: {
            getUser: ( query, cb ) => {

              cb( null, {
                id: 1,
                uid: 1234,
                email: 'blorg@cibul.net',
                culture: 'en',
                name: 'Gaetanne',
                thumbnail: null
              } );

            }
          }
        } ) );

        sessions.sync( request, ( err, result ) => {

          result.success.should.equal( true );

          result.data.culture.should.equal( 'en' );

          done();

        } );

      } );

    } );

  } );

  describe( '.get', () => {

    it( 'get takes request and calls back with session data', done => {

      sessions.open( request, { uid: 1234 }, () => {

        sessions.get( request, { detailed: true }, ( err, session ) => {

          should( err ).equal( null );

          Object.keys( session ).should.eql( [
            'culture',
            'uid',
            'name', 
            'thumbnail',
            'id',
            'email',
            'latestActivity'
          ] );

          _.omit( session, [ 'latestActivity' ] )

          .should.eql( {
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

    it( 'get takes uid and calls back with session data', done => {

      sessions.open( request, { uid: 12345678 }, () => {

        sessions.get( 12345678, ( err, session ) => {

          should( err ).equal( null );

          _.omit( session, [ 'latestActivity' ] )

          .should.eql( {
            uid: 12345678,
            culture: 'fr',
            name: 'Gaetan Latouche',
            thumbnail: '//graph.facebook.com/100002280111541/picture'
          } );

          done();

        } );

      } );

    } );

    it( 'get for an unset session gives back null', done => {

      sessions.get( 12345678, ( err, session ) => {

        should( err ).equal( null );

        should( session ).equal( null );

        done();

      } );

    } );

  } );

  describe( '.isLogged', () => {

    it( 'determines based on request when user is logged', () => {

      const req = {
        session: {
          user: { name: 'gaetan', uid: 123, culture: 'fr' }
        }
      }

      sessions.isLogged( req ).should.equal( true );

    } );

    it( '.. and when the user is not logged', () => {

      const req = {
        session: {}
      }

      sessions.isLogged( req ).should.equal( false );

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

          h.redisHGet( config.redis.hash, config.redis.prefix + 'therandomsessioncode', ( err, result ) => {

            should( err ).equal( null );
            should( result ).equal( null );

            done();

          } );

        } );

      } );

    } );

  } );

} ); 