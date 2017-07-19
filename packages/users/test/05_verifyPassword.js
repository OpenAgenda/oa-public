"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.verifyPassword', function () {

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

  it( 'verify password', done => {

    service.verifyPassword( { email: 'gaetan@cibul.net', password: 'cibulon' }, ( err, result ) => {

      should( err ).equal( null );
      should( result ).equal( true );

      done();

    } );

  } );

} );
