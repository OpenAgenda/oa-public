"use strict";

var should = require( 'should' ),

validators = require( './build' );

describe( 'text validator', () => {

  describe( 'required', () => {

    var validate = validators.text( {
      field: 'text', 
      min: 3, 
      max: 10,
      optional: false
    } );


    it( 'trims by default', () => {

      let clean = validate( ' pneu ' );

      clean.should.equal( 'pneu' );

    } );


    it( 'wrong type', () => {

      try {

        validate( { grut: 'blip' } );

      } catch( e ) {

        e[ 0 ].code.should.equal( 'string.invalidtype' )

      }

    } );


    it( 'too long', () => {

      try {

        validate( 'fdssqfdsqfdsqfdsq' );

      } catch( e ) {

        e[ 0 ].code.should.equal( 'string.toolong' );

      }

    } );


    it( 'too short', () => {

      try {

        validate( 'fd' );

      } catch( e ) {

        e[ 0 ].code.should.equal( 'string.tooshort' );

      }

    } );


    it( 'required with default returns default when nothing is given', () => {

      let validate = validators.text( {
        field: 'text',
        optional: false,
        default: 'Mama, I just killed a man, put a gun against his head, pulled my trigger now he\'s dead'
      } ),

      errors = [], clean = false;

      try {

        clean = validate();

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.should.equal( 'Mama, I just killed a man, put a gun against his head, pulled my trigger now he\'s dead' );

    } );


    it( 'required empty string is not valid', () => {

      let validate = validators.text( { field: 'text', max: 10, optional: false } ),

      errors = [];

      try {

        validate( '' );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 1 );

    } );


  } );

  describe( 'optional', () => {

    it( 'undefined or null cleans to null', () => {

      let validate = validators.text( { field: 'text', min: 3, max: 10 } );

      should( validate() )

      .equal( null );

    } );

    it( 'empty string cleans to null', () => {

      let validate = validators.text( { field: 'text', min: 3, max: 10 } );

      should( validate( '' ) )

      .equal( null );

    } );


  } );


  describe( 'as list of texts', () => {

    it( 'validates list of text when list bool is set to true', () => {

      let validate = validators.text( {
        field: 'text',
        list: true,
        optional: false
      } );

      should( validate( [ 'fsqfsdqs', 'fds' ] ) )

      .eql( [ 'fsqfsdqs', 'fds' ] );

    } );

    it.only( 'considers an undefined value like an empty array when list bool is set to true', () => {

      let validate = validators.text( {
        field: 'text',
        list: true
      } );

      should( validate() )

      .eql( [] );

    } );

  } );

  

} );