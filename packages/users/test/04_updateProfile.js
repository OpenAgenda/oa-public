"use strict";

process.env.NODE_ENV = 'test';

const config = require( '../testconfig' ),

  should = require( 'should' ),

  fixtures = require( '@openagenda/fixtures' ),

  service = require( '../service' ),

  mysql = require( 'mysql' );


describe( '.updateProfile', function () {

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

  it( 'update profile', done => {

    service.updateProfile( { id: 2, full_name: 'Nouveau ptit nom', culture: 'en' }, ( err, result ) => {

      should( err ).equal( null );

      service.get( { id: 2 }, { detailed: true }, ( err, user ) => {

        should( err ).equal( null );
        user.full_name.should.equal( 'Nouveau ptit nom' );
        user.culture.should.equal( 'en' );

        done();

      } );

    } );

  } );

  it( 'update profile with bad info', done => {

    service.updateProfile( { id: 2, culture: 'rhaaaa' }, ( err, result ) => {

      should( err ).equal( null );
      result.errors[ 0 ].code.should.equal( 'string.toolong' );

      done();

    } );

  } );

} );
