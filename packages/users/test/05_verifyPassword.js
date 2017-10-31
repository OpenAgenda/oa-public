"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.verifyPassword', function () {

  this.timeout( 20000 );

  before( async () => {

    await service.initAndLoad( config );
    await require( 'keys' ).init( config );

  } );

  before( done => {

    fixtures.init( config );

    fixtures( [ {
      table: config.schemas.key,
      src: __dirname + '/fixtures/key.data.sql'
    } ], { reset: false }, done );

  } );

  it( 'successful verification', done => {

    service.verifyPassword( { email: 'gaetan@cibul.net', password: 'cibulon' }, ( err, result ) => {

      should( err ).equal( null );
      should( result ).equal( true );

      done();

    } );

  } );


  it( 'non existing account', done => {

    service.verifyPassword( { email: 'bravo.kevin@lol.vd', password: 'doesntmatter' }, ( err, success ) => {

      should( err ).equal( null );

      success.should.equal( false );

      done();

    } );

  } );


  it( 'with get option to true', done => {

    service.verifyPassword( { email: 'gaetan@cibul.net', password: 'cibulon' }, { get: true }, ( err, result ) => {

      should( err ).equal( null );
      should( result.success ).equal( true );
      should( result.user.email ).equal( 'gaetan@cibul.net' );

      done();

    } );

  } );


  it( 'with get, detailed & camel options', done => {

    service.verifyPassword(
      { email: 'gaetan@cibul.net', password: 'cibulon' },
      { get: true, detailed: true, camel: true },
      ( err, result ) => {

        should( err ).equal( null );
        should( result.success ).equal( true );
        should( result.user.email ).equal( 'gaetan@cibul.net' );
        should( result.user.isActivated ).equal( 1 );

        done();

      } );

  } );

} );
