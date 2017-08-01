"use strict";

process.env.NODE_ENV = 'test';

const sessions = require( '../' );
const should = require( 'should' );
const config = require( '../testconfig' );
const isoConfig = require( '../iso/config' );
const h = require( './lib/helpers' );
const _ = require( 'lodash' );
const async = require( 'async' );

const users = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/lib/users.json', 'utf-8' ) );

describe( 'session - functional (server): scan', () => {

  h.init( config );

  let request;

  beforeEach( h.clearRedis );

  beforeEach( () => {

    sessions.init( _.extend( {}, config, {
      interfaces: {
        getUser: ( query, cb ) => {

          cb( null, users[ query.uid ] );

        }
      }
    } ) );

  } );


  beforeEach( () => {

    request = {
      cookies: {},
      session: {}
    };

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

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

    sessions.scan( 0, 2, ( err, sessions, nextCursor ) => {

      try {

        should( err ).equal( null );

        nextCursor.should.not.equal( 0 );

        should( sessions.length ).not.lessThan( 2 );

        done();        

      } catch( e ) { 

        return done( e );

      }

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