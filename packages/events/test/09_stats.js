"use strict";

const svc = require( '../service/test' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'events - functional (server): stats', function() {

  this.timeout( 10000 );

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.test.fixtures( [
      config.schemas.event,
      config.legacy.schemas.event
    ], done );

  } );

  it( 'get stat info on event full sets', done => {

    svc.stats( ( err, stats ) => {

      should( err ).equal( null );

      stats.should.eql( {
        total: 456,
        legacy: {
          total: 2016
        }
      } )

      done();

    } );

  } );

} );