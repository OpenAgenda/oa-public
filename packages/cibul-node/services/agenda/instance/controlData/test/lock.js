"use strict";

var should = require( 'should' ),

lock = require( '../lib/lock' ),

config = require( '../../../../../config' ),

async = require( 'async' );

lock.init( {
  redis: config.redis,
  namespace: 'locktesting'
});

describe( 'controlData - lock', function( ) {

  beforeEach( lock.test.clear );

  it( 'only one resource can access lock at the same time', function( done ) {

    var lockCount = 0;

    lock( function( err, unlock ) {

      lockCount++;

    });

    lock( function( err, unlock ) {

      lockCount++;

    });

    setTimeout( function() {

      lockCount.should.equal( 1 );

      done();

    }, 400 );

  } );

  it( 'should be accessible sequentially', function( done ) {

    var count = 0;

    async.timesSeries( 3, function( n, tcb ) {

      lock( function( err, unlock ) {

        count++

        unlock( tcb );

      });

    }, function() {

      count.should.equal( 3 );

      done();

    });

  } );

} );