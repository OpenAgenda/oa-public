"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( 'fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.refreshLastSignin', function () {

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

  it( 'refreshLastSignin', done => {

    service.get( { id: 3843 }, { detailed: true }, ( err, user ) => {

      service.refreshLastSignin(
        { id: 3843 },
        ( err, success ) => {

          should( err ).equal( null );
          should( success ).eql( true );

          service.get( { id: 3843 }, { detailed: true }, ( err2, modifiedUser ) => {

            should( user.last_signin ).below( modifiedUser.last_signin );

            done();

          } );

        }
      );

    } );

  } );

} );
