"use strict";

const should = require( 'should' );

const validators = require( './build' );

describe( 'choice validator', () => {

  describe( 'basic usage', () => {

    const validate = validators.choice( {
      options: [ 2, 4, 13, 12 ]
    } );

    it( 'is optional by default', () => {

      validate().should.eql( [] );

    } );

    it( 'keeps known values in clean result', () => {

      validate( [ 1, 2, 3 ] ).should.eql( [ 2 ] );

    } );

    it( 'single value is handled as 1 value array', () => {

      validate( 2 ).should.eql( [ 2 ] );

    } );

    it( 'validator is of type "choice"', () => {

      validate.type.should.equal( 'choice' );

    } );

  } );

  describe( 'still pretty basic usage', () => {

    const validate = validators.choice( {
      options: [ 2, 4, 12, 13 ],
      optional: false,
      key: 'id'
    } );

    it( 'cleans keyed values', () => {

      validate( [ { id: 2, 'label': 'two' }, { id: 12, value: 'twelve' } ] )

      .should.eql( [ 2, 12 ] );

    } );

    it( 'throws error on empty input if not optional', () => {

      let errors = [];

      try {

        validate( 3 );

      } catch( e ) {

        errors = e;

      }

      errors.should.eql( [ {
        code: 'choice.required',
        message: 'a (known) value must be chosen',
        origin: 3
      } ] );

    } );

    it( 'default value can be specified', () => {

      let clean;      

      const validate = validators.choice( {
        options: [ 2, 4, 12, 13 ],
        optional: false,
        key: 'id',
        default: [ 2 ]
      } );

      try {

        clean = validate()

      } catch( e ) {}

      clean.should.eql( [ 2 ] );

    } );

  } );

  describe( 'fielded', () => {

    let validate = validators.choice( {
      options: [ 2, 4, 12, 13 ],
      field: 'etpaf',
      optional: false
    } );

    it( 'when field value is set, it comes out in error', () => {

      let errors = [];

      try {

        validate();

      } catch( e ) { errors = e };

      errors[ 0 ].field.should.equal( 'etpaf' );

    } );

  } );

  describe( 'restrict input to a predefined number of choices', () => {

    let validate = validators.choice( {
      options: [ 2, 4, 12, 13 ],
      min: 2,
      max: 3
    } );

    it( 'being below min throws error', () => {

      let errors = [];

      try {

        validate( 2 );

      } catch( e ) { errors = e; }

      errors.should.eql( [ {
        code: 'choice.required.min',
        message: 'between %min% and %max% choices must be made',
        values: { min: 2, max: 3 },
        origin: 2
      } ] );

    } );

    it( 'being above max throws error', () => {

      let errors = [];

      try {

        validate( [ 2, 4, 12, 13 ] );

      } catch( e ) { errors = e; }

      errors.should.eql( [ {
        code: 'choice.required.max',
        message: 'between %min% and %max% choices must be made',
        values: { min: 2, max: 3 },
        origin: [ 2, 4, 12, 13 ]
      } ] );

    } );


  } );

} );