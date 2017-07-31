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

describe( 'session - functional (server): get', () => {

  h.init( config );

  let request;

  beforeEach( h.clearRedis );

  beforeEach( () => sessions.init( config ) );

  beforeEach( () => {

    request = { cookies: {}, session: {} };

    request.cookies[ isoConfig.cookies.session ] = 'therandomsessioncode';

  } );

  it( 'get takes request and calls back with session data', done => {

    sessions.open( request, { uid: 1234 }, ( err, result ) => {

      sessions.get( request, ( err, session ) => {

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
          id: 1,
          email: 'gaetan@cibul.net',
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

} )