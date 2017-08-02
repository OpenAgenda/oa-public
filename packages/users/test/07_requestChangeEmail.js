"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.requestChangeEmail', function () {

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

  it( 'change email', done => {

    service.requestChangeEmail( {
      id: 119,
      email: 'gaetan@openagenda.com'
    }, ( err, result ) => {

      should( err ).equal( null );

      service.confirmChangeEmail( {
        id: 119,
        token: result.token
      }, ( err, result ) => {

        should( err ).equal( null );
        result.should.equal( true );

        service.get( { id: 119 }, ( err, user ) => {

          should( err ).equal( null );
          user.email.should.equal( 'gaetan@openagenda.com' );

          done();

        } );

      } );

    } );

  } );

  it( 'change email with already taken', done => {

    service.requestChangeEmail( {
      id: 2,
      email: 'gaetan@openagenda.com'
    }, ( err, result ) => {

      should( err ).equal( null );
      result.errors[ 0 ].code.should.equal( 'email.alreadytaken' );

      done();

    } );

  } );

} );
