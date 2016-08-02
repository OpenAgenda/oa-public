"use strict";

var should = require( 'should' ),

dateValidator = require( './build/date' );

describe( 'date validator', () => {

  it( 'returns undefined if nothing is given', () => {

    let validate = dateValidator();

    should( validate() ).equal( undefined );

  } );

  it( 'returns default value if is defined and nothing is input', () => {

    let kBirth = new Date( '1994-12-26T03:45:04Z' );

    let validate = dateValidator( { default: kBirth } ),

    time = validate().getTime(), kTime = kBirth.getTime();

    time.should.equal( kTime );

  } );

  it( 'returns current date if default is set to \'now\'', done => {

    let validate = dateValidator( { default: 'now' } ),

    time = ( new Date() ).getTime(),

    delta = 200;

    setTimeout( () => {

      let validatedDefaultTime = validate().getTime();

      ( validatedDefaultTime - time ).should.be.belowOrEqual( delta + 10 );
      ( validatedDefaultTime - time ).should.be.aboveOrEqual( delta - 10 );

      done();

    }, delta );

  } );

  it( 'cleans string to date when possible', () => {

    let validate = dateValidator();

    should( validate( '2011-11-11T00:00:00Z' ) instanceof Date ).equal( true );

  } );


  it( 'cleans to corresponding date', () => {

    let validate = dateValidator();

    should( validate( '2011-11-11T00:00:00Z' ).getTime() ).equal( ( new Date( '2011-11-11T00:00:00Z' ) ).getTime() );

  } );


  it( 'throw error on invalid input', () => {

    let validate = dateValidator(), errors = [];

    try {

      validate( 'fdqfdsqf' );

    } catch( e ) {

      errors = e;

    }

    errors.should.eql( [ {
      code: 'date.invalid',
      message: 'not a date',
      origin: 'fdqfdsqf' 
    } ] );

  } );

  it( 'throw error on non optional empty input', () => {

    let validate = dateValidator( { optional: false } ),

    errors = [];

    try {

      validate()

    } catch( e ) {

      errors = e;

    }

    errors.should.eql( [ { 
      code: 'date.required',
      message: 'a date is required',
      origin: undefined 
    } ] );

  } );


  it( 'throw error on bounded input - min', () => {

    let now = new Date(),

    validate = dateValidator( { min: now } ),

    errors = [],

    earlier = new Date( ( new Date() ).getTime() - 1000 );

    try {

      validate( earlier );

    } catch ( e ) {

      errors = e;

    }

    errors.should.eql( [ { 
      code: 'date.toosmall',
      message: 'date is too small',
      values: { min: errors[ 0 ].values.min },
      origin: errors[ 0 ].origin
    } ] );

  } );


  it( 'throw error on bounded input - max', () => {

    let now = new Date(),

    validate = dateValidator( { max: now } ),

    errors = [],

    later = new Date( ( new Date() ).getTime() + 1000 );

    try {

      validate( later );

    } catch ( e ) {

      errors = e;

    }

    errors.should.eql( [ { 
      code: 'date.toobig',
      message: 'date is too big',
      values: { max: errors[ 0 ].values.max },
      origin: errors[ 0 ].origin
    } ] );

  } );

} );