"use strict";

const should = require( 'should' );

const validators = require( '../src' );

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

  it( 'does not validate if something that does not parse into integer is given', () => {

    let errors = [];

    try {

      validators.integer()( 'one two three' );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 1 );

    errors[ 0 ].should.eql( { 
      code: 'integer.invalid',
      message: 'not an integer',
      origin: 'one two three'
    } );

  } );

  it( 'defaults to default when no value is given', () => {

    validators.integer( { default: 3 } )().should.equal( 3 );

  } );

  it( '...event when default is null', () => {

    should( validators.integer( { default: null } )() ).equal( null );

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

  it( 'validates a list of integers', () => {

    validators.integer( { list: true } )( [ 1, 2, 3 ] )

    .should.eql( [ 1, 2, 3 ] );

  } );

  it( 'if no value is provided to list validator, empty list is returned', () => {

    validators.integer( { list: true } )()

    .should.eql( [] );

  } );

  it( 'if no value is provided to list validator with predefined default, default is returned', () => {

    should( validators.integer( { list: { default: null } } )() ).equal( null );

  } );

} );