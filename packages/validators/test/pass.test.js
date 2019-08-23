"use strict";

const validators = require( '../src' );

describe( 'pass validator', () => {

  let validate = validators.pass();

  it( 'passes anything', () => {

    expect(validate( 'anything' )).toBe('anything');

  } );

  it( 'passes lists of anything', () => {

    let listOfAnything = [ 'fdsqfdss', 123, { a: 'b' } ];

    expect(validators.pass( { list: true } )( listOfAnything )).toEqual(listOfAnything);

  } );

  it( 'passes default if nothing is given and default is defined', () => {

    expect(validators.pass( {
      default: 'grut'
    } )()).toBe('grut');

  } );;

} );