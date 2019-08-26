"use strict";

const validators = require( '../src' );

describe( 'list validator', () => {

  describe( 'basic', () => {

    var validate = validators.list( [
      validators.link(),
      validators.phone(),
      validators.email()
    ] );

    it( 'cleans list of invalid values', () => {

      let clean = validate.clean( [ 'fdfdsqf', 'mail@gmail.com', 'fdsqfdsq' ] );

      expect(clean.length).toBe(1);
      expect(clean[ 0 ]).toBe('mail@gmail.com');

    } );


    it( 'validates a list', () => {

      let clean = validate( [ 'contact@email.com', '06' ] );

      expect(clean).toEqual([ 'contact@email.com', '06' ]);

    } );


    it( 'undefined input is handled as empty list', () => {

      expect(validate()).toEqual([]);

    } );


    it( 'errors a list', () => {

      var errors = [];

      try {

        validate( [ 'fdsfdsq', '06 50 91' ] );

      } catch ( e ) {

        errors = e;

      }

      expect(errors.length).toBe(3);

    } );


    it( 'gives index of each error returned', () => {

      let errors = [];

      try {

        validate( [ 'name@email.com', 'rereer', '012394' ] );

      } catch( e ) { errors = e; }

      errors.forEach( e => {

        expect(e.index).toBe(1);

      } );

      try {

        validate( [ 'name@email.com', 'anothername@email.com', 'rereer', '012394' ] );

      } catch( e ) { errors = e; }

      errors.forEach( e => {

        expect(e.index).toBe(2);

      } );

    } )


    it( 'decorates a valid item with detected type', () => {

      var dec = validate.decorateItem( ' youpidou@gmail.com ' );

      expect(dec).toEqual({
        value: 'youpidou@gmail.com',
        type: 'email'
      });

    } );


    it( 'decorates an invalid item', () => {

      var dec = validate.decorateItem( 'fdfqds' );

      expect(dec.value).toBe('fdfqds');

      expect(dec.errors.length).toBe(3);

    } );


    it( 'errors an item', () => {

      let errors = [];

      try {

        validate.validateItem( 'fqfdq' );

      } catch ( e ) {

        errors = e;

      }

      expect(errors.length).toBe(3);

    } );

    it( 'validates an item', () => {

      var clean = validate.validateItem( 'phone@number.com' );

      expect(clean).toBe('phone@number.com');

    } );

  } );

  describe( 'initialized with types list', () => {

    let validate = validators.list( {
      types: [ 'link', 'phone', 'email' ],
      validators: {
        link: validators.link,
        phone: validators.phone,
        email: validators.email
      }
    } );

    it( 'includes stuff', () => {

      expect(validate( [ '08381', 'email@site.com', 'https://oa.com' ] )).toEqual([ '08381', 'email@site.com', 'https://oa.com' ]);

    } );

  } );

  describe( 'with field', () => {

    var validate = validators.list( {
      field: 'myfield',
      types: [ 'link', 'phone', 'email' ],
      validators: {
        link: validators.link,
        phone: validators.phone,
        email: validators.email
      }
    } );

    it( 'includes field name in error', () => {

      let errors = false

      try {

        validate( 'fdsf' );

      } catch ( e ) {

        errors = e;

      }

      expect(errors[ 0 ].field).toBe('myfield');

    } );

  } );

  describe( 'optional', () => {

    var validate = validators.list( { optional: true }, [
      validators.link(),
      validators.phone(),
      validators.email()
    ] );

    it( 'no input returns empty list', () => {

      expect(validate()).toEqual([]);

    } );

  } );

} );
