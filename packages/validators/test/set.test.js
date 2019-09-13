"use strict";

var validators = require( '../src' );

describe( 'set validator', () => {

  describe( 'compacted', () => {

    var validate = validators.set( [
      validators.text( {
        field: 'name',
        min: 3,
        max: 10
      } ),
      validators.email( {
        field: 'user_email'
      } ),
      validators.phone( {
        field: 'user_phone'
      } )
    ], { compact: true } );

    it( 'returns compacted clean values', () => {

      var clean = expect(validate( [ {
        field: 'name',
        value: 'Toto'
      }, {
        field: 'user_email',
        value: 'to.to@tata.com'
      }, {
        field: 'user_phone',
        value: '04 50 49 12 22'
      } ] )).toEqual({
        name: 'Toto',
        user_email: 'to.to@tata.com',
        user_phone: '04 50 49 12 22'
      });

    } );

  } );

  describe( 'basic usage', () => {

    var validate = validators.set( [
      validators.text( {
        field: 'name',
        min: 3,
        max: 10
      } ),
      validators.email( {
        field: 'user_email'
      } ),
      validators.phone( {
        field: 'user_phone'
      } )
    ] );


    it( 'all erroring inputs are given by validator', () => {

      let errors = [];

      try {

        validate( [ {
          field: 'name',
          value: 'Titi et Balancemoitroiserreurs sont sur un bateau'
        }, {
          field: 'user_email',
          value: 'Titi tombe à l\'eau'
        }, {
          field: 'user_phone',
          value: 'Qui est ce qui reste?'
        } ] );

      } catch( e ) {

        errors = e;

      }

      expect(errors.length).toBe(3);

      expect(errors[ 0 ].field).toBe('name');

      expect(errors[ 1 ].field).toBe('user_email');

      expect(errors[ 2 ].field).toBe('user_phone');

    } );


    it( 'returns clean values without issue', () => {

      let errors = null, clean = null;

      try {

        clean = validate( [ {
          field: 'name',
          value: 'Toto'
        }, {
          field: 'user_email',
          value: 'to.to@tata.com'
        }, {
          field: 'user_phone',
          value: '04 50 49 12 22'
        } ] );

      } catch( e ) {

        errors = e;

      }

      expect( errors ).toBeNull();

      expect(clean).toEqual([ {
        field: 'name',
        value: 'Toto'
      }, {
        field: 'user_email',
        value: 'to.to@tata.com'
      }, {
        field: 'user_phone',
        value: '04 50 49 12 22'
      } ]);

    } );


  } );

  

} );