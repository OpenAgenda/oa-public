"use strict";

const validators = require( '../src' );

describe( 'phone validator', () => {

  var validate = validators.phone( { field: 'telephone' } );

  it( 'a phone number with spaces is a phone number', () => {

    const clean = validate( '06 50 91 60' );

    expect(clean).toBe('06 50 91 60');

  } );

  it( 'an international phone number is a phone number', () => {

    const clean = validate( '+33 (0)6 50 91 60 26' );

    expect(clean).toBe('+33 (0)6 50 91 60 26');

  } );

  it( 'a phone number with dots or dashes is a phone number', () => {

    const clean = validate( '+(1) 800-123-123' );

    expect(clean).toBe('+(1) 800-123-123');    

  } );

  it( 'an empty input for a compulsory value returns a required error', () => {

    let errors = [];

    try {

      validators.phone( { field: 'telephone', optional: false } )();

    } catch( e ) {

      errors = e;

    }

    expect(errors[ 0 ]).toEqual({ 
      origin: undefined,
      field: 'telephone',
      code: 'required',
      message: 'value must not be empty' 
    });

  } );

  it( 'is a phone and is trimmed', () => {

    let clean = validate( ' 06509160 ' );

    expect(clean).toBe('06509160');

  } );

  it( 'is not a phone', () => {

    let caught = false;

    try {

      validate( 'fdsqf' );

    } catch( e ) {

      caught = true;

      expect(e[ 0 ].code).toBe('phone.invalid');

      expect(e[ 0 ].field).toBe('telephone'); 

    }

  } );

  it( 'optional field accepts empty input', function() {

    var validate = validators.phone( { field: 'telephone', 'optional' : true } ),

    errors = [], clean;

    try {

      clean = validate()

    } catch ( e ) {

      errors = e;

    }

    expect(errors.length).toBe(0);

    expect( clean ).toBeNull();

  } );

} );