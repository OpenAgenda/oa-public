"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( '@openagenda/fixtures' ),

  service = require( './service' ),

  mysql = require( 'mysql' );


describe( '.get', function () {

  this.timeout( 20000 );

  before( async () => {

    await service.initAndLoad( config );
    await require( '@openagenda/keys' ).init( config );

  } );

  before( done => {

    fixtures.init( config );

    fixtures( [ {
      table: config.schemas.key,
      src: __dirname + '/fixtures/key.data.sql'
    } ], { reset: false }, done );

  } );

  it( 'get by id (query is object)', done => {

    service.get( { id: 2 }, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get by id (query is number)', done => {

    service.get( 2, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get by uid', done => {

    service.get( { uid: 99999999 }, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get by email', done => {

    service.get( { email: 'romain.lange@gmail.com' }, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get by key', done => {

    service.get( { key: '317e316466a629c8dacd4aa81f39c930' }, ( err, user ) => {

      should( err ).equal( null );
      user.email.should.equal( 'romain.lange@gmail.com' );

      done();

    } );

  } );

  it( 'get inexistent user', done => {

    service.get( { email: 'blablabla@sorry.com' }, ( err, user ) => {

      should( err ).equal( null );
      should( user ).equal( null );

      done();

    } );

  } );

  it( 'get user with detailed option', done => {

    service.get( { id: 2 }, { detailed: true }, ( err, user ) => {

      should( err ).equal( null );
      should( user ).have.property( 'api_key' );
      should( user ).have.property( 'facebook_uid' );
      should( user ).have.property( 'last_signin' );

      done();

    } );

  } );

  it( 'get user with detailed & camel options', done => {

    service.get( { id: 2 }, { detailed: true, camel: true }, ( err, user ) => {

      should( err ).equal( null );
      should( user ).have.property( 'apiKey' );
      should( user ).have.property( 'facebookUid' );
      should( user ).have.property( 'lastSignin' );

      done();

    } );

  } );

} );
