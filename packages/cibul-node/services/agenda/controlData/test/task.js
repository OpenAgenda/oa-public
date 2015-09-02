"use strict";

process.env.NODE_ENV = 'test';

//require( 'debug' ).enable( 'controlData' );

var should = require( 'should' ),

task = require( '../lib/task' ),

store = require( '../lib/store' ),

lock = require( '../lib/lock' ),

config = require( '../../../../config' ),

q = require( 'queue' )( 'testtaskqueue:queue', { redis: config.redis } );

store.init( {
  redis: config.redis,
  namespace: 'teststore'
});

task.init( {
  redis: config.redis,
  queuesNamespace: 'testtaskqueue'
} );

lock.init( {
  redis: config.redis,
  namespace: 'testlock'
});

task.test.setInterval( 100 );

describe( 'controlData - task', function() {

  beforeEach( lock.test.clear );

  beforeEach( q.test.clear );

  this.timeout( 10000 );

  it( 'queued id gets processed by build', function( done ) {

    /**
     * item queued goes first in buffer, 
     */

    task.test.setBuild( function( data, cb ) {

      data.id.should.equal( 1 );

      done();

    });

    task();

    q( { id: 1 } );

  });

  it( 'queued three times same id should still be processed only once', function( done ) {

    var count = 0;

    task.test.setBuild( function( data, cb ) {

      count++;

    });

    task();

    q( { id: 12 } );
    q( { id: 12 } );
    q( { id: 12 } );

    setTimeout( function() {

      count.should.equal( 1 );

      done();

    }, 200 );

  });

} );