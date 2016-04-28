"use strict";

const should = require( 'should' ),

validators = require( '../' );

describe( 'pass validator', () => {

  let validate = validators.pass();

  it( 'passes everything', () => {

    validate( 'anything' )

    .should.equal( 'anything' );

  } );

} );