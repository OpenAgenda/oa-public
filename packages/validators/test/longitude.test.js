"use strict";

var validators = require( '../src' );

describe( 'longitude validator', () => {

  let validate = validators.longitude();

  it( 'throws error if longitude is too small', () => {

    let errors = false;

    try {

      validate( -181 );

    } catch( e ) {

      errors = e;

    }

    expect(errors).toEqual([ {
      field: false,
      code: 'longitude.toosmall',
      message: 'longitude cannot be less than -180',
      origin: -181
    } ]);

  } );

  it( 'throws error if longitude is too big', () => {

    let errors = false;

    try {

      validate( 181 );

    } catch( e ) {

      errors = e;

    }

    expect(errors).toEqual([ {
      field: false,
      code: 'longitude.toobig',
      message: 'longitude cannot be more than 180',
      origin: 181
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
      code: 'longitude.invalid',
      message: 'not a number',
      origin: 'fdsqfdsq'
    } ]);

  } );

  it( 'validates a longitude', () => {

    let errors = false;

    try {

      expect(validate( '2.4534' )).toBe(2.4534);

    } catch ( e ) {

      errors = e;

    }

    expect(errors).toBe(false);

  } );

} );