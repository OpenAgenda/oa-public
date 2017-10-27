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

  it( 'passes default if nothing is given and default is defined', () => {

    validators.pass( {
      default: 'grut'
    } )()

      .should.equal( 'grut' );

  } );;

} );