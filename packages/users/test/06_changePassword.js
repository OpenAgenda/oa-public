"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.changePassword', function () {

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

  it( 'change password', done => {

    service.changePassword( {
      id: 119,
      new_password: 'openagendon'
    }, ( err, result ) => {

      should( err ).equal( null );

      service.verifyPassword( { email: 'gaetan@cibul.net', password: 'openagendon' }, ( err, result ) => {

        should( err ).equal( null );
        should( result ).equal( true );

        done();

      } );

    } );

  } );

} );
