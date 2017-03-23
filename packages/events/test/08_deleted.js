"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'events - functional (server): deleted', function() {

  this.timeout( 5000 );

  beforeEach( done => {

    svc.initAndLoad( config, done );

  } );

  afterEach( svc.shutdown );

  it( 'deleted gives deleted event uids with deletion timestamp', done => {

    svc.deleted( 0, 10, ( err, deleted ) => {

      should( err ).equal( null );

      deleted.length.should.equal( 10 );

      Object.keys( deleted[ 0 ] ).should.eql( [ 'uid', 'deletedAt' ] );

      done();

    } )

  } );

} );