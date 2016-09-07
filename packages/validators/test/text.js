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

  

} );