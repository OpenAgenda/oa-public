"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( '@openagenda/fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.refresh', function () {

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

  it( 'refreshLastSignin - deprecated', done => {

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


  it( 'refresh - last inbox check', done => {

    service.get( { id: 3843 }, { detailed: true, camel: true }, ( err, user ) => {

      service.refresh( 'lastInboxCheck',
        { id: 3843 },
        ( err, success ) => {

          should( err ).equal( null );
          should( success ).eql( true );

          service.get( { id: 3843 }, { detailed: true, camel: true }, ( err, modifiedUser ) => {


            should( user.lastInboxCheck ).equal( null );

            modifiedUser.lastInboxCheck.should.ok;

            done();

          } );

        }
      );

    } );

  } );

} );
