"use strict";

var should = require( 'should' ),

validators = require( '../' );

describe( 'list validator', () => {

  describe( 'basic', () => {

    var validate = validators.list( [
      validators.link(),
      validators.phone(),
      validators.email()
    ] );


    it( 'cleans list of invalid values', () => {

      let clean = validate.clean( [ 'fdfdsqf', 'mail@gmail.com', 'fdsqfdsq' ] );

      clean.length.should.equal( 1 );
      clean[ 0 ].should.equal( 'mail@gmail.com' );

    } );


    it( 'validates a list', () => {

      let clean = validate( [ 'contact@email.com', '06' ] );

      clean.should.eql( [ 'contact@email.com', '06' ] );

    } );


    it( 'errors a list', () => {

      var errors = [];

      try {

        validate( [ 'fdsfdsq', '06 50 91' ] );

      } catch ( e ) {

        errors = e;

      }

      errors.length.should.equal( 3 );

    } );


    it( 'decorates a valid item', () => {

      var dec = validate.decorateItem( ' youpidou@gmail.com ' );

      dec.should.eql( {
        value: 'youpidou@gmail.com',
        type: 'email'
      } );

    } );


    it( 'decorates an invalid item', () => {

      var dec = validate.decorateItem( 'fdfqds' );

      dec.value.should.equal( 'fdfqds' );

      dec.errors.length.should.equal( 3 );

    } );


    it( 'errors an item', () => {

      let errors = [];

      try {

        validate.validateItem( 'fqfdq' );

      } catch ( e ) {

        errors = e;

      }

      errors.length.should.equal( 3 );

    } );

    it( 'validates an item', () => {

      var clean = validate.validateItem( 'phone@number.com' );

      clean.should.equal( 'phone@number.com' );

    } );

  } );

  describe( 'with field', () => {

    var validate = validators.list( { field: 'myfield' }, [
      validators.link(),
      validators.phone(),
      validators.email()
    ] );

    it( 'includes field name in error', () => {

      let errors = false

      try {

        validate( 'fdsf' );

      } catch ( e ) {

        errors = e;

      }

      errors[ 0 ].field.should.equal( 'myfield' );

    } );

  } );

  describe( 'optional', () => {

    var validate = validators.list( { optional: true }, [
      validators.link(),
      validators.phone(),
      validators.email()
    ] );

    it( 'no input returns empty list', () => {

      validate()

      .should.eql( [] );

    } );

  } );

} );