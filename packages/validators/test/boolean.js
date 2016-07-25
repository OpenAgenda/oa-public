"use strict";

let should = require( 'should' ),

validators = require( './build' );

describe( 'boolean validator', () => {

  it( 'returns null if nothing is given on an optional validator', () => {

    let optionalValidate = validators.boolean( {
      optional: true
    } );

    should( optionalValidate() ).equal( null );

  } );

  it( 'puts a default value if nothing is specified', () => {

    let validate = validators.number( {
      default: true
    } );

    validate().should.equal( true );

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

    errors.length.should.equal( 1 );

    errors[ 0 ].code.should.equal( 'required' );

  } );


  it( 'cleans a valid entry', () => {

    let validate = validators.boolean( {
      field: '11or12',
      optional: false,
    } );

    validate( '11' ).should.equal( true );

  });

} );