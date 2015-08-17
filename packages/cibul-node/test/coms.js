/**
 * test queue and consume features
 */

process.env.NODE_ENV = 'test';

var config = require('../config'),

log = require( 'logger' )( 'coms tests' ),

should = require( 'should' ),

coms = require( '../lib/coms' );


describe( 'testing persistent queue', function() {

  it( '#persistentConsume', function( done ) {

    var i = 0;

    coms.persistentConsume( 'test', function( err, data ) {

      log( 'consuming %s', i );

      i++;

      if ( i == 3 ) {

        data.should.have.property( 'third', 'data');

        done();

      }

    });


    log( 'queuing 1' );

    coms.queue( 'test', { some: 'data' });

    setTimeout( function() {

      log( 'queuing 2' );

      coms.queue( 'test', { someMore: 'randomData' } );

    }, 100 );

    setTimeout( function() {

      log( 'queuing 3' );

      coms.queue( 'test', { third: 'data' } );

    }, 300 );

  } );

});