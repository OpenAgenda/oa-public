"use strict";

var should = require( 'should' ),

validators = require( '../src' );

describe( 'latitude validator', () => {

  let validate = validators.latitude();

  it( 'throws error if latitude is too small', () => {

    let errors = false;

    try {

      validate( -91 );

    } catch( e ) {

      errors = e;

    }

    errors.should.eql( [ {
      field: false,
      code: 'latitude.toosmall',
      message: 'latitude cannot be less than -90',
      origin: -91
    } ] );

  } );

  it( 'throws error if latitude is too big', () => {

    let errors = false;

    try {

      validate( 91 );

    } catch( e ) {

      errors = e;

    }

    errors.should.eql( [ {
      field: false,
      code: 'latitude.toobig',
      message: 'latitude cannot be more than 90',
      origin: 91
    } ] );

  } );

  it( 'throws error if crap is given', () => {

    let errors = false;

    try {

      validate( 'fdsqfdsq' );

    } catch( e ) {

      errors = e;

    }

    errors.should.eql( [ {
      field: false,
      code: 'latitude.invalid',
      message: 'not a number',
      origin: 'fdsqfdsq'
    } ] );

  } );

  it( 'validates a latitude', () => {

    let errors = false;

    try {

      validate( '2.4534' ).should.equal( 2.4534 );

    } catch ( e ) {

      errors = e;

    }

    errors.should.equal( false );

  } );

} );