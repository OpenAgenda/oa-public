"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.setNewFlag', function () {

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

  before( done => {

    service.init( config, done );

  } );

  it( 'setNewFlag - set flag to 0', done => {

    service.setNewFlag( { id: 3843 },
      false,
      ( err, success ) => {

        should( err ).equal( null );
        should( success ).eql( true );

        done();

      } );

  } );

} );
