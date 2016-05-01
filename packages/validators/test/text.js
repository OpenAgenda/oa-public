"use strict";

var should = require( 'should' ),

validators = require( '../' );

describe( 'text validator', () => {

  describe( 'required (default)', () => {

    var validate = validators.text( { field: 'text', min: 3, max: 10 } );

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

  } );

  describe( 'optional', () => {

    var validate = validators.text( { field: 'text', min: 3, max: 10, optional: true } );

    it( 'undefined or null cleans to null', () => {

      should( validate() )

      .equal( null );

    } );

    it( 'empty string cleans to null', () => {

      should( validate( '' ) )

      .equal( null );

    } );

  } );

  

} );