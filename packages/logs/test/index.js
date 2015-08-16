"use strict";

var should = require( 'should' ),

logger = require( '../' );

describe( 'logger', function() {

  it( 'requires initialization before first use', function() {

    logger.init( false );

    var log = logger( 'tests' ),

    result = log( 'this will not do anything' );

    should( result ).equal( null );

  } );

  it( 'creates entries once initialized', function() {

    logger.init( { token: '2624667a-1903-4d21-8d5d-ea14b86409aa' } );

    var log = logger( 'tests' );

    log( 'this will give back the same' ).should.eql( {
      level: 'debug',
      namespace: 'tests',
      message: 'this will give back the same'
    } );

    log.load( { reference: 300 } );

    log( 'info', 'this is %s', 'sparta' ).should.eql( {
      level: 'info',
      namespace: 'tests',
      message: 'this is sparta',
      reference: 300
    } );

    log( 'info', { code: 200, message: 'yeepeekayyay %s' }, 'motherfucker' ).should.eql( {
      level: 'info',
      namespace: 'tests',
      message: 'yeepeekayyay motherfucker',
      code: 200,
      reference: 300
    } );

  } );

});