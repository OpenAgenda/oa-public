"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.set', function () {

  this.timeout( 20000 );

  before( done => {

    fixtures.init( config );

    fixtures( [ {
      table: config.schemas.user,
      src: __dirname + '/fixtures/user.data.sql'
    }, {
      table: config.schemas.apiKeySet,
      src: __dirname + '/fixtures/api_key_set.data.sql'
    } ], done );

  } );

  before( async () => {

    await service.init( config );

  } );

  it( 'set', done => {

    service.set( { id: 2, full_name: 'Romain' }, ( err, result ) => {

      should( err ).equal( null );
      result.user.email.should.equal( 'romain.lange@gmail.com' );
      result.user.full_name.should.equal( 'Romain' );

      done();

    } );

  } );

  it( 'set inexistent user', done => {

    service.set( { id: 987654321, full_name: 'Je fais du caca là !' }, ( err, result ) => {

      should( err ).equal( null );
      should( result.user ).equal( null );

      done();

    } );

  } );

  it( 'create', done => {

    service.set( {
      full_name: 'Test et retest',
      email: 'test.test@openagenda.com',
      culture: 'fr',
      password: 'passwooord'
    }, ( err, result ) => {

      should( err ).equal( null );

      service.get( { id: result.user.id }, ( err, user ) => {

        should( err ).equal( null );
        should.exist( user.uid );
        user.full_name.should.equal( 'Test et retest' );
        user.email.should.equal( 'test.test@openagenda.com' );

        done();

      } );

    } );

  } );

  it( 'create with protected field but without protected option', done => {

    service.set( {
      full_name: 'Test et retest',
      email: 'test.test2@openagenda.com',
      culture: 'fr',
      password: 'passwooord',
      is_activated: 1
    }, ( err, result ) => {

      should( err ).equal( null );

      service.get( { id: result.user.id }, { detailed: true }, ( err, user ) => {

        should( err ).equal( null );
        user.full_name.should.equal( 'Test et retest' );
        user.email.should.equal( 'test.test2@openagenda.com' );
        user.is_activated.should.equal( 0 );

        done();

      } );

    } );

  } );

  it( 'create an activated account', done => {

    service.set( {
      full_name: 'Test et retest',
      email: 'test.test3@openagenda.com',
      culture: 'fr',
      password: 'passwooord',
      is_activated: 1
    }, { protected: false }, ( err, result ) => {

      should( err ).equal( null );

      service.get( { id: result.user.id }, { detailed: true }, ( err, user ) => {

        should( err ).equal( null );
        user.full_name.should.equal( 'Test et retest' );
        user.email.should.equal( 'test.test3@openagenda.com' );
        user.is_activated.should.equal( 1 );

        done();

      } );

    } );

  } );

  it( 'create user with bad info', done => {

    service.set( {
      full_name: 'Test et retest',
      email: 'cestpasunemailca',
      culture: 'frolala'
    }, ( err, result ) => {

      should( err ).equal( null );
      result.errors.length.should.equal( 2 );

      done();

    } );

  } );

} );
