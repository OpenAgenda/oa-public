"use strict";

const svc = require( '../service/test' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'list events', function() {

  this.timeout( 5000 );

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.test.fixtures( [
      config.schemas.event
    ], done );

  } );

  it( 'simple remove', done => {

    let identifier = { uid: 3564473 };

    svc.get( identifier, ( err, event ) => {

      event.uid.should.equal( identifier.uid );

      svc.remove( identifier, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        svc.get( identifier, ( err, event ) => {

          should( event ).equal( null );

          done();

        } );

      } );

    } );

  } );

} );