"use strict";

const should = require( 'should' ),

validators = require( '../src' );

describe( 'pass validator', () => {

  let validate = validators.pass();

  it( 'passes anything', () => {

    validate( 'anything' )

    .should.equal( 'anything' );

  } );

  it( 'passes lists of anything', () => {

    let listOfAnything = [ 'fdsqfdss', 123, { a: 'b' } ];

    validators.pass( { list: true } )( listOfAnything )

      .should.eql( listOfAnything );

  } );

} );