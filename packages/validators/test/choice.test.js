"use strict";

const validators = require( '../src' );

describe( 'choice validator', () => {

  describe( 'basic usage', () => {

    const validate = validators.choice( {
      options: [ 2, 4, 13, 12 ]
    } );

    it( 'is optional by default', () => {

      expect(validate()).toEqual([]);

    } );

    it( 'keeps known values in clean result', () => {

      expect(validate( [ 1, 2, 3 ] )).toEqual([ 2 ]);

    } );

    it( 'single value is handled as 1 value array', () => {

      expect(validate( 2 )).toEqual([ 2 ]);

    } );

    it( 'validator is of type "choice"', () => {

      expect(validate.type).toBe('choice');

    } );

  } );

  describe( 'still pretty basic usage', () => {

    const validate = validators.choice( {
      options: [ 2, 4, 12, 13 ],
      optional: false,
      key: 'id'
    } );

    it( 'cleans keyed values', () => {

      expect(validate( [ { id: 2, 'label': 'two' }, { id: 12, value: 'twelve' } ] )).toEqual([ 2, 12 ]);

    } );

    it( 'throws error on empty input if not optional', () => {

      let errors = [];

      try {

        validate( 3 );

      } catch( e ) {

        errors = e;

      }

      expect(errors).toEqual([ {
        code: 'choice.required',
        message: 'a (known) value must be chosen',
        origin: 3
      } ]);

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

        clean = validate();

      } catch( e ) {}

      expect(clean).toEqual([ 2 ]);

    } );

    it( 'unique option outputs clean unique value', () => {

      let clean;

      const validate = validators.choice( {
        options: [ 2, 4 ],
        unique: true
      } );

      try {

        clean = validate( 2 );

      } catch( e ) {}

      expect(clean).toBe(2);

    } );

    it( 'default unique output is null by default', () => {

      let clean;

      const validate = validators.choice( {
        options: [ 2, 4 ],
        unique: true
      } );

      try {

        clean = validate();

      } catch( e ) {}

      expect( clean ).toBeNull();

    } );

    it( 'default unique output can be specified', () => {

      let clean;

      const validate = validators.choice( {
        options: [ 22, 44 ],
        default: 22,
        unique: true
      } );

      try {

        clean = validate();

      } catch( e ) {}

      expect(clean).toBe(22);

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

      expect(errors[ 0 ].field).toBe('etpaf');

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

      expect(errors).toEqual([ {
        code: 'choice.required.min',
        message: 'between %min% and %max% choices must be made',
        values: { min: 2, max: 3 },
        origin: 2
      } ]);

    } );

    it( 'being above max throws error', () => {

      let errors = [];

      try {

        validate( [ 2, 4, 12, 13 ] );

      } catch( e ) { errors = e; }

      expect(errors).toEqual([ {
        code: 'choice.required.max',
        message: 'between %min% and %max% choices must be made',
        values: { min: 2, max: 3 },
        origin: [ 2, 4, 12, 13 ]
      } ]);

    } );


  } );

} );