"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( '@openagenda/fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.generateApiKey', function () {

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

  it( 'regenerate public api key', done => {

    service.get( { id: 119 }, ( err, user ) => {

      should( err ).equal( null );

      service.generateApiKey( { id: 119 }, ( err, result ) => {

        should( err ).equal( null );
        should( result.key ).not.equal( user.api_key );

        done();

      } );

    } );

  } );

  it( 'generate new public api key', done => {

    service.get( { id: 439 }, ( err, user ) => {

      should( err ).equal( null );

      service.generateApiKey( { id: 439 }, ( err, result ) => {

        should( err ).equal( null );
        should( result.key ).not.equal( user.api_key );

        done();

      } );

    } );

  } );

  it( 'generate secret api key', done => {

    service.get( { id: 1 }, { detailed: true }, ( err, user ) => {

      should( err ).equal( null );

      service.generateApiKey( { id: 1 }, { secret: true }, ( err, result ) => {

        should( err ).equal( null );
        should( result.key ).not.equal( user.api_secret );

        done();

      } );

    } );

  } );

} );
