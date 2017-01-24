"use strict";

const express = require( 'express' );
const config = require( '../testconfig' );
const sessions = require( '../' );
const sa = require( 'superagent' );
const cookieParser = require( 'cookie-parser' );
const validate = require( '../iso/cookie.validate' );
const helpers = require( './lib/helpers' );
const base64 = require( 'utils/base64' );
const _ = require( 'lodash' );
const should = require( 'should' );

const mw = sessions.middleware;

describe( 'session - functional (server): middleware', () => {

  let server;

  beforeEach( () => {

    sessions.init( config );

    helpers.init( config );

  } );

  describe( '.sync', () => {

    let server;

    afterEach( done => server.close( done.bind( null ) ) );

    it( 'updates session with data fetched from getUser interface', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land' : helpers.roundTrip,
        'post:/signin' : [ 
          ( req, res, next ) => {
            
            req.userIdentifier = { uid: 123 }; 

            next(); 

          },
          mw.open(),
          ( req, res ) => { res.send( 'ok' ) } 
        ],
        'post:/sync' : [
          ( req, res, next ) => {

            // change test getUser to send different
            // data.
            sessions.init( _.extend( {}, config, {
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

            next();

          },
          mw.sync(),
          ( req, res ) => { 

            res.send( 'ok' )

          }
        ]
      } );

      _runClientSyncRoutine().then( res => {

        let dc = base64.decode( res.header[ 'set-cookie' ][ 0 ].split( '=' )[ 1 ].split( ';' )[ 0 ] ).replace( String.fromCharCode( 0 ), '' );

        JSON.parse( dc )

          .user.culture.should.equal( 'en' );

        done()

      } );

    } );

    function _runClientSyncRoutine() {

      const agent = sa.agent();

      return agent.get( 'http://localhost:3000/land' )

        .then( () => agent.post( 'http://localhost:3000/signin' ) )

        .then( () => agent.post( 'http://localhost:3000/sync' ) );

    }

  } );

  describe( '.open', () => {

    let server;

    afterEach( done => server.close( done.bind( null ) ) );

    it( 'a session can be opened using service.open', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land' : helpers.roundTrip,
        'post:/signin': ( req, res, next ) => {

          sessions.open( req, { uid: 123 }, ( err, result ) => {

            res.send( 'ok' );

          } );

        },
        'get:/cookied': ( req, res, next ) => {

          sessions.get( req, ( err, session ) => {

            session.should.eql( {
              culture: 'fr',
              uid: 12345678,
              name: 'Gaetan Latouche',
              thumbnail: '//graph.facebook.com/100002280111541/picture'
            } );

            res.send( 'ok' );

          } );

        }
      } );

      _runClientOpenRoutine().then( res => done() );

    } );


    it( '.. or using the open middleware', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land' : helpers.roundTrip,
        'post:/signin': [ 
          ( req, res, next ) => {

            // you know beforehand based on an email
            // or other who is trying to sign in.
            req.userIdentifier = { uid: 123 }; 

            next(); 

          },
          mw.open(), // <= this opens the logged user session
          ( req, res ) => {

            req.result.success.should.equal( true );

            // resut will contain result of session open operation
            req.result.cookieData.should.eql( {
              user: {
                culture: 'fr',
                uid: 12345678,
                name: 'Gaetan Latouche',
                thumbnail: '//graph.facebook.com/100002280111541/picture'
              }
            } );

            res.send( 'ok' );

          }
        ],
        'get:/cookied': ( req, res, next ) => {

          sessions.get( req, ( err, session ) => {

            session.should.eql( {
              culture: 'fr',
              uid: 12345678,
              name: 'Gaetan Latouche',
              thumbnail: '//graph.facebook.com/100002280111541/picture'
            } );

            res.send( 'ok' )

          } );

        }
      } );

      _runClientOpenRoutine().then( res => done() );

    } );


    function _runClientOpenRoutine() {

      const agent = sa.agent();

      return agent.get( 'http://localhost:3000/land' )

        .then( () => agent.post( 'http://localhost:3000/signin' ) )

        .then( () => agent.get( 'http://localhost:3000/cookied' ) );

    }


  } );

  describe( '.ifLogged / .ifUnlogged', () => {

    let server;

    beforeEach( helpers.clearRedis );

    afterEach( done => server.close( done.bind( null ) ) );

    it( '.ifUnlogged calls given middleware if user is unlogged', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : helpers.roundTrip,
        'post:/any' : [
          mw.ifUnlogged( ( req, res, next ) => {

            res.send( { ladida: true } )

          } ),
          ( req, res, next ) => { res.send( { ladida: false } ) }
        ]
      } );

      _runClientIfLoggedRoutine( false ).then( res => {

        res.body.should.eql( { ladida: true } );

        done();

      } );

    } );


    it( '.ifUlnogged calls next if user is logged', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : [
          mw.open(),
          ( req, res ) => { res.send( 'ok' ); }
        ],
        'post:/any' : [
          mw.ifUnlogged( ( req, res, next ) => {

            res.send( { ladida: true } )

          } ),
          ( req, res, next ) => { res.send( { ladida: false } ) }
        ]
      } );

      _runClientIfLoggedRoutine( true ).then( res => {

        res.body.should.eql( { ladida: false } );

        done();

      } );

    } );

    it( '.ifLogged calls next if user is not logged', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : helpers.roundTrip,
        'post:/any' : [
          mw.ifLogged( ( req, res, next ) => {

            res.send( { ladida: true } )

          } ),
          ( req, res, next ) => { res.send( { ladida: false } ) }
        ]
      } );

      _runClientIfLoggedRoutine( false ).then( res => {

        res.body.should.eql( { ladida: false } );

        done();

      } );

    } );

    it( '.ifLogged calls given middleware if user is logged', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : [
          mw.open(),
          ( req, res ) => { res.send( 'ok' ); }
        ],
        'post:/any' : [
          mw.ifLogged( ( req, res, next ) => {

            res.send( { ladida: true } )

          } ),
          ( req, res, next ) => { res.send( { ladida: false } ) }
        ]
      } );

      _runClientIfLoggedRoutine( true ).then( res => {

        res.body.should.eql( { ladida: true } );

        done();

      } );

    } )

    function _runClientIfLoggedRoutine( signin = false ) {

      const agent = sa.agent();

      return agent.get( 'http://localhost:3000/land' )

        .then( () => signin ? agent.post( 'http://localhost:3000/signin' ) : () => {} )

        .then( () => agent.post( 'http://localhost:3000/any' ) );

    }

  } )

  describe( '.close', () => {

    let server;

    afterEach( done => server.close( done.bind( null ) ) );

    it( 'a session can be closed using service.close', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : [
          ( req, res, next ) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          ( req, res ) => { res.send( 'ok' ); }
        ],
        'post:/signout' : ( req, res, next ) => {

          sessions.close( req, ( err, result ) => {

            result.success.should.equal( true );

            should( req.session ).equal( null );

            res.send( 'ok' );

          } );

        }
      } );

      _runClientCloseRoutine().then( res => { done(); } );

    } );

    it( '.. or using the close middleware', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : [
          ( req, res, next ) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          ( req, res ) => { res.send( 'ok' ); }
        ],
        'post:/signout' : [
          ( req, res, next ) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.close(),
          ( req, res, next ) => {

            req.result.success.should.equal( true );

            should( req.session ).equal( null );

            res.send( 'ok' );

          }
        ]
      } );

      _runClientCloseRoutine().then( res => { done(); } );

    } );

    function _runClientCloseRoutine() {

      const agent = sa.agent();

      return agent.get( 'http://localhost:3000/land' )

        .then( () => agent.post( 'http://localhost:3000/signin' ) )

        .then( () => agent.post( 'http://localhost:3000/signout' ) );

    }

  } );

  describe( '.load', () => {

    let server;

    afterEach( done => server.close( done.bind( null ) ) );

    it( 'loads logged user cookie info in req.user', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : [
          ( req, res, next ) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          ( req, res ) => { res.send( 'ok' ); }
        ],
        'get:/get' : [
          mw.load(),
          ( req, res ) => {

            req.user.should.eql( {
              culture: 'fr',
              uid: 12345678,
              name: 'Gaetan Latouche',
              thumbnail: '//graph.facebook.com/100002280111541/picture'
            } );

            res.send( 'ok' );

          }
        ]
      } );

      _runClientGetRoutine().then( res => { done(); } );

    } );

    it( 'loads all user info when detailed: true option is set', done => {

      server = helpers.launchTestApp( {
        use: mw,
        'get:/land': helpers.roundTrip,
        'post:/signin' : [
          ( req, res, next ) => { req.userIdentifier = { uid: 123 }; next(); },
          mw.open(),
          ( req, res ) => { 

            res.send( 'ok' ); 

          }
        ],
        'get:/get' : [
          mw.load( { detailed: true } ),
          ( req, res ) => {

            _.omit( req.user, [ 'latestActivity' ] ).should.eql( {
              id: 1,
              culture: 'fr',
              uid: 12345678,
              name: 'Gaetan Latouche',
              thumbnail: '//graph.facebook.com/100002280111541/picture',
              email: 'gaetan@cibul.net'
            } );

            res.send( 'ok' );

          }
        ]
      } );

      _runClientGetRoutine().then( res => { done(); } );

    } );

    function _runClientGetRoutine() {

      const agent = sa.agent();

      return agent.get( 'http://localhost:3000/land' )

        .then( () => agent.post( 'http://localhost:3000/signin' ) )

        .then( () => agent.get( 'http://localhost:3000/get' ) );

    }

  } )

} );