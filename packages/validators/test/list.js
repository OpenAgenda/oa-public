"use strict";

var should = require( 'should' ),

validators = require( './build' );

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
    

    it( 'undefined input is handled as empty list', () => {

      validate().should.eql( [] );

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


    it( 'gives index of each error returned', () => {

      let errors = [];

      try {

        validate( [ 'name@email.com', 'rereer', '012394' ] );

      } catch( e ) { errors = e; }

      errors.forEach( e => {

        e.index.should.equal( 1 );

      } );

      try {

        validate( [ 'name@email.com', 'anothername@email.com', 'rereer', '012394' ] );

      } catch( e ) { errors = e; }

      errors.forEach( e => {

        e.index.should.equal( 2 );

      } );

    } )


    it( 'decorates a valid item with detected type', () => {

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

      validate( [ '08381', 'email@site.com', 'https://oa.com' ] )

      .should.eql( [ '08381', 'email@site.com', 'https://oa.com' ] );

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