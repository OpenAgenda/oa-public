"use strict";

const express = require( 'express' );
const config = require( '../testconfig' );
const sessions = require( '../' );
const sa = require( 'superagent' );
const cookieParser = require( 'cookie-parser' );
const validate = require( '../iso/cookie.validate' );
const helpers = require( './lib/helpers' );
const _ = require( 'lodash' );
const should = require( 'should' );

const mw = sessions.middleware;

describe( 'session - functional (server): middleware', () => {

  let server;

  beforeEach( () => {

    sessions.init( config );

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
              flash: null,
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

} );