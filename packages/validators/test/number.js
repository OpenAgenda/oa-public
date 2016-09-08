"use strict";

var should = require( 'should' ),

validators = require( './build' );

describe( 'number validator', () => {

  it( 'returns null if nothing is given on an optional validator', () => {

    let optionalValidate = validators.number( {
      optional: true
    } );

    should( optionalValidate() ).equal( null );

  } );

  it( 'puts a default value if nothing is specified', () => {

    let validate = validators.number( {
      default: 13
    } );

    validate( '' ).should.equal( 13 );

  } );

  it( 'default value can be 0', () => {

    validators.number( { default: 0 } )().should.equal( 0 );

  } );

  it( 'puts a default value if is defined, nothing is specified and is required', () => {

    let requiredValidate = validators.number( {
      optional: false,
      default: 8
    } ),

    errors = [], clean = 'not clean';

    try {

      clean = requiredValidate();

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 0 );

    clean.should.equal( 8 );

  } );

  it( 'throws an error if is not optional and no default is specified', () => {

    let validate = validators.number( {
      optional: false
    }), 

    errors = [];

    try {

      validate( '' );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 1 );

    errors[ 0 ].code.should.equal( 'required' );

  } );

  it( 'throws an error if value is not a number', () => {

    let validate = validators.number( {} ),

    errors = [];

    try {

      validate( 'fdsqfds' );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 1 );

    errors[ 0 ].code.should.equal( 'number.invalid' );

  } );

  it( 'throws an error if value exceeds a limit', () => {

    let validate = validators.number( {
      max: 10
    } ),

    errors = [];

    try {

      validate( '56' );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 1 );

    errors[ 0 ].code.should.equal( 'number.toobig' ); 

  });

  it( 'cleans a valid entry', () => {

    let validate = validators.number( {
      field: '11or12',
      min: 11,
      max: 12,
      optional: false,
    } );

    validate( '11' ).should.equal( 11 );

  });

} );