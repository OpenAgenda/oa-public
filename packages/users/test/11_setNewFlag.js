"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

const fixtures = require( '@openagenda/fixtures' );

const config = require( '../testconfig' );
const service = require( '../service' );


describe( '.setNewFlag', function () {

  this.timeout( 20000 );

  before( async () => {

    await service.initAndLoad( config );

  } );

  before( done => {

    fixtures.init( config );

    fixtures( [], { reset: false }, done );

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
