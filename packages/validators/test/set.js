"use strict";

var validators = require( '../' ),

should = require( 'should' );

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

      var clean = validate( [ {
        field: 'name',
        value: 'Toto'
      }, {
        field: 'user_email',
        value: 'to.to@tata.com'
      }, {
        field: 'user_phone',
        value: '04 50 49 12 22'
      } ] )

      .should.eql( {
        name: 'Toto',
        user_email: 'to.to@tata.com',
        user_phone: '04 50 49 12 22'
      } );

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

      errors.length.should.equal( 3 );

      errors[ 0 ].field.should.equal( 'name' );

      errors[ 1 ].field.should.equal( 'user_email' );

      errors[ 2 ].field.should.equal( 'user_phone' );

    } );


    it.skip( 'ommitted input is caught by validator', () => {

      let errors = [];

      try {

        validate( [ {
          field: 'name',
          value: 'Toto'
        }, {
          field: 'user_phone',
          value: '04 03 02 01'
        } ] )

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 1 );

      errors[ 0 ].should.eql( {
        field: 'user_email',
        code: 'email.invalid',
        message: 'email is not valid',
        origin: undefined
      } );

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

      should( errors ).equal( null );

      clean.should.eql( [ {
        field: 'name',
        value: 'Toto'
      }, {
        field: 'user_email',
        value: 'to.to@tata.com'
      }, {
        field: 'user_phone',
        value: '04 50 49 12 22'
      } ] );

    } );


  } );

  

} );