"use strict";

const svc = require( './service' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'events - functional (server): stats', function() {

  this.timeout( 30000 );

  beforeEach( done => {

    svc.initAndLoad( config, [
      config.schemas.event,
      config.legacy.schemas.event
    ], { reset: true }, done );

  } );

  afterEach( svc.shutdown );

  it( 'get stat info on event full sets', done => {

    svc.stats( ( err, stats ) => {

      should( err ).equal( null );

      stats.should.eql( {
        total: 456,
        legacy: {
          total: 2017
        }
      } )

      done();

    } );

  } );

} );