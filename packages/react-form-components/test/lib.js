"use strict";

var should = require( 'should' ),

orValidators = require( '../lib/orValidators' ),

validators = require( '../validators' );

describe( 'lib', () => {

  describe( 'orValidators', () => {

    it( 'should give back email validator', () => {

      let v = orValidators( 'admin@openagenda.com', [
        validators.email(),
        validators.phone(),
        validators.link()
      ] );

      v.type.should.equal( 'email' );

    } );

    it( 'should throw errors of all validators', () => {

      var errors;

      try {

        orValidators( 'fdqfdqq', [
          validators.email(),
          validators.phone(),
          validators.link()
        ] );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 3 );


    } );

  } );


} )