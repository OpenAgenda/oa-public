"use strict";

var validators = require( '../src' );

describe( 'email validator', () => {

  var validate = validators.email( { field: 'email' } );

  it( 'is an email and is trimmed', () => {

    let clean = validate( ' kaore@cibul.net ' );

    expect(clean).toBe('kaore@cibul.net');

  } );

  it( 'returns null if input is null and validaor is optional', () => {

    expect( validators.email( { optional: true } )() ).toBeNull();

  } );

  it( 'is not an email', () => {

    let caught = false;

    try {

      validate( 'fdsqf' );

    } catch( e ) {

      caught = true;

      expect(e[ 0 ].code).toBe('email.invalid');

    }

  } );

  it( 'some long random string with an email does not validate', () => {

    let caught = false;

    try {

      validate( 'Amandine Plas ( chargéés de la com et du spons ) contacts: protable 06 33 09 49 72 email: usmelunhand@wanadoo.fr' );

    } catch( e ) {

      caught = true;

      expect(e[ 0 ].code).toBe('email.invalid');

    }

    expect(caught).toBe(true);

  } );

  it( 'validate lists of emails', () => {

    let emails = [
      'kev@gmail.com',
      'in@gmail.com',
      'ber@gmail.com',
      'to@gmail.com',
      'mmier@gmail.com'
    ];

    expect(validators.email( { list: true } )( emails )).toEqual(emails);

  } );

  it( 'invalid emails', () => {

    let errors = [],

      validate = validators.email(),

      notEmails = [
        'momo@bertho@gmail.com'
      ];

    notEmails.forEach( notEmail => {

      try {

        validate( notEmail );

      } catch ( e ) {

        errors.push( e );

      }

    } );

    expect(notEmails.length).toBe(errors.length);

  } );

  it( 'validate lists of emails for non optional validator', () => {

    let emails = [
      
    ], errors = [];

    try {

      validators.email( { list: true, optional: false } )( [] );  

    } catch( e ) {

      errors = e;

    }

    expect(errors).toEqual([ { 
      field: undefined,
      code: 'list.required',
      message: 'list cannot be empty',
      origin: [] 
    } ]);

  } );

} );