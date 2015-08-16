"use strict";

var should = require( 'should' ),

u = require( '../lib/utilities' );

describe( 'logger utilities', function() {

  it( 'getLogType', function() {

    u.getLogLevel( 'info' ).should.equal( 'info' );

    u.getLogLevel( 'not a log type' ).should.equal( 'debug' );

  });

  it( 'compileMessage', function() {

    u.compileMessage( 'this is a message' ).should.equal( 'this is a message' );

    u.compileMessage( 'this is a %s', 'message' ).should.equal( 'this is a message' );

    u.compileMessage( 'this %s a %s', 'ate', 'horse' ).should.equal( 'this ate a horse' );

  });

});