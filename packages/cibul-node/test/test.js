process.env.NODE_ENV = 'test';

var config = require('../config'),

log = require( '../lib/logger' )( 'homepage tests' ),

should = require( 'should' );

describe( 'empty test', function() {

  it( '#empty', function( done ) {

    done();	

  } );

} );
