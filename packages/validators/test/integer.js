"use strict";

const should = require( 'should' );

const validators = require( './build' );

describe( 'integer validator', () => {

  it( 'validates an integer', () => {

    let validate = validators.integer();

    try {

      validate( 2 ).should.equal( 2 );
      
    } catch ( e ) {

      console.log( e );

    }

  } );

  it( 'cleans an integer that was given as text', () => {

    validators.integer()( '2' ).should.equal( 2 );

  } );

  it( 'defaults to default when no value is given', () => {

    validators.integer( { default: 3 } )().should.equal( 3 );

  } );

  it( 'does not validate a number that is not an integer', () => {

    let errors = [];

    try {

      validators.integer()( 2.2 );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 1 );

    errors[ 0 ].should.eql( { 
      code: 'integer.invalid',
      message: 'not an integer',
      origin: 2.2 
    } );

  } );

} );