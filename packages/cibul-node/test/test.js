process.env.NODE_ENV = 'test';

var config = require('../config'),

log = require( '../lib/logger' )( 'homepage tests' ),

should = require( 'should' );

describe.only( 'whatever', function() {

  it( '#one', function( done ) {

    done();	

  } );

} );
