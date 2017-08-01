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

describe( 'session - functional (server): close', () => {

  h.init( config );

  let request;

  beforeEach( h.clearRedis );

  beforeEach( () => sessions.init( config ) );

  beforeEach( () => {

    request = { cookies: {}, session: {} };

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

  } );

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

      h.redisGet( [ config.redis.prefix, 12345678 ].join( ':' ), ( err, result ) => {

        JSON.parse( result ).email.should.equal( 'gaetan@cibul.net' );

        sessions.close( request, ( err, result ) => {

          h.redisGet( [ config.redis.prefix, 12345678 ].join( ':' ), ( err, result ) => {

            should( err ).equal( null );
            should( result ).equal( null );

            done();

          } );

        } );

      } );

    } );

  } );

} );