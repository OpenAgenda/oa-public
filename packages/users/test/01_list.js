"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.list', function () {

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

  it( 'list', done => {

    service.list( 0, 10, ( err, users ) => {

      should( err ).equal( null );

      service.list( 4, 1, ( err, offsetUsers ) => {

        should( err ).equal( null );
        users.length.should.equal( 10 );
        offsetUsers.length.should.equal( 1 );
        users[ 4 ].id.should.equal( offsetUsers[ 0 ].id );

        done();

      } );

    } );

  } );

} );
