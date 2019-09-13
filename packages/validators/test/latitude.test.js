"use strict";

var validators = require( '../src' );

describe( 'latitude validator', () => {

  let validate = validators.latitude();

  it( 'throws error if latitude is too small', () => {

    let errors = false;

    try {

      validate( -91 );

    } catch( e ) {

      errors = e;

    }

    expect(errors).toEqual([ {
      field: false,
      code: 'latitude.toosmall',
      message: 'latitude cannot be less than -90',
      origin: -91
    } ]);

  } );

  it( 'throws error if latitude is too big', () => {

    let errors = false;

    try {

      validate( 91 );

    } catch( e ) {

      errors = e;

    }

    expect(errors).toEqual([ {
      field: false,
      code: 'latitude.toobig',
      message: 'latitude cannot be more than 90',
      origin: 91
    } ]);

  } );

  it( 'throws error if crap is given', () => {

    let errors = false;

    try {

      validate( 'fdsqfdsq' );

    } catch( e ) {

      errors = e;

    }

    expect(errors).toEqual([ {
      field: false,
      code: 'latitude.invalid',
      message: 'not a number',
      origin: 'fdsqfdsq'
    } ]);

  } );

  it( 'validates a latitude', () => {

    let errors = false;

    try {

      expect(validate( '2.4534' )).toBe(2.4534);

    } catch ( e ) {

      errors = e;

    }

    expect(errors).toBe(false);

  } );

  it( 'optional returns null when given nothing', () => {

    let result = validate();

    expect( result ).toBeNull();

  } );

} );