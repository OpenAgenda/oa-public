"use strict";

var should = require( 'should' ),

store = require( '../lib/store' ),

config = require( '../../../../config' ),

async = require( 'async' ),

cli = require( 'redis' ).createClient( config.redis.port, config.redis.host );

store.init( {
  redis: config.redis,
  namespace: 'testingstore'
} );

describe( 'controlData store', function() {

  var ids = [ 12, 32, 95, 2910 ]; // random

  beforeEach( store.test.clear );

  it( 'buffer: stores agenda ids', function( done ) {

    async.eachSeries( ids, function( id, ecb ) {

      store.buffer.add( id, ecb );

    }, function() {

      cli.hgetall( 'testingstore:buffer', function( err, result ) {

        should( err ).equal( null );

        result.should.eql( { '12': '1', '32': '1', '95': '1', '2910': '1' } );

        done();

      });

    } );

  });

  it( 'buffer: flush gives an array of ids', function( done ) {

    async.eachSeries( ids, function( id, ecb ) {

      store.buffer.add( id, ecb );

    }, function() {

      store.buffer.flush( function( err, flushedIds ) {

        should( err ).equal( null );

        flushedIds.should.eql( ids );

        done();

      });

    });

  });

});