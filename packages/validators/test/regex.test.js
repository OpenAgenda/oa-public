"use strict";

const validators = require( '../src' );

describe( 'regex validator', () => {

  var validate = validators.regex( { field: 'stars', regex: /\*/g } );

  it( 'matches', () => {

    let errors = [];

    try {

      validate( '***' );

    } catch ( e ) {

      errors = e;

    }

    expect(errors.length).toBe(0);

  } );

  it( 'does not match', () => {

    let errors = [];

    try { validate( '+++' ) } catch( e ) { errors = e; }

    expect(errors.length).toBe(1);

  } );

  it( 'cleans using regex', () => {

    let validate = validators.regex( { regex: /[^\/]+$/, clean: true } ),

    errors = [], clean = false;

    try { clean = validate( '/image/path.png' ); } catch( e ) { errors = e; }

    expect(errors.length).toBe(0);

    expect(clean).toBe('path.png');

  } );

} );