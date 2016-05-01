"use strict";

const should = require( 'should' ),

multilingual = require( '../multilingual' );

describe( 'multilingual validator', () => {

  describe( 'non optional', () => {

    let validate = multilingual( {
      field: 'multitext',
      min: 3
    } );

    it( 'gives text errors with associated lang', () => {

      let errors = [];

      try {

        validate( {
          en: 'En',
          fr: 'Contenu Français'
        } );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 1 );

      errors[ 0 ].should.eql( {
        field: 'multitext',
        code: 'string.tooshort',
        message: 'the string is too short',
        values: { min: 3, max: 1000000 },
        origin: 'En',
        lang: 'en'
      } );

    } );

    it( 'validates and cleans multilingual content', () => {

      let clean = validate( {
        en: 'English content',
        fr: 'Contenu Français'
      } );

      clean.should.eql( {
        en: 'English content',
        fr: 'Contenu Français'
      } );

    } );

  } );


} );