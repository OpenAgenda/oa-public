"use strict";

let validators = require( '../src' );

describe( 'boolean validator', () => {

  it( 'cleans true to true', () => {

    expect(validators.boolean()( true )).toBe(true);

  } );

  it( 'returns null if nothing is given on an optional validator', () => {

    let optionalValidate = validators.boolean( {
      optional: true
    } );

    expect( optionalValidate() ).toBeNull();

  } );

  it( 'returns default value if default value is given', () => {

    let optionalValidate = validators.boolean( {
      optional: true,
      default: null
    } );

    expect( optionalValidate( null ) ).toBeNull();

  } );

  it( 'puts a default value if nothing is specified', () => {

    let validate = validators.number( {
      default: true
    } );

    expect(validate()).toBe(true);

  } );

  it( 'throws an error if is not optional and no default is specified', () => {

    let validate = validators.boolean( {
      optional: false
    }), 

    errors = [];

    try {

      validate();

    } catch( e ) {

      errors = e;

    }

    expect(errors.length).toBe(1);

    expect(errors[ 0 ].code).toBe('required');

  } );


  it( 'cleans a valid entry', () => {

    let validate = validators.boolean( {
      field: '11or12',
      optional: false,
    } );

    expect(validate( '11' )).toBe(true);

  });

  it( 'cleans \'0\' to false', () => {

    expect(validators.boolean()( '0' )).toBe(false);

  } );

  it( 'cleans \'false\' to false', () => {

    expect(validators.boolean()( 'false' )).toBe(false);

  } );

  it( 'if default is null and nothing is given, returns null', () => {

    let validate = validators.boolean( {
      field: 'whocares',
      default: null
    } );

    expect( validate() ).toBeNull();

  } );

  it( 'if default is null and null is given, returns null', () => {

    let validate = validators.boolean( {
      field: 'whocares',
      default: null
    } );

    expect( validate( null ) ).toBeNull();

  } );

  it( 'if given value is null and default is not set, cleans as false', () => {

    let validate = validators.boolean( {
      field: 'meh'
    } );

    expect(validate( null )).toBe(false);

  } );

  it( 'if given value is null and allowNull option is true, cleans as null', () => {

    let validate = validators.boolean( {
      field: 'mnieeeh',
      allowNull: true
    } );

    expect( validate( null ) ).toBeNull();

  } );

} );