"use strict";

const should = require( 'should' ),

multilingual = require( './build/multilingual' );

describe( 'multilingual validator', () => {

  describe( 'non optional', () => {

    let validate = multilingual( {
      field: 'multitext',
      min: 3,
      optional: false
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

    it( 'empty input on non-optional validator means an error', () => {

      let errors = [];

      try {

        validate();

      } catch( e ) { 

        errors = e;

      }

      errors.length.should.equal( 1 );

      errors[ 0 ].should.eql( {
        field: 'multitext',
        code: 'required',
        message: 'at least one language entry is required',
        origin: undefined
      } );

    } );

  } );

  it( 'null or undefined keyed value filtered out', () => {

    let validate = multilingual(),

    clean = false,

    errors = [];

    try {

      clean = validate( {
        en: null,
        fr: 'Le texte anglais est franchement nul.'
      } );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 0 );

    clean.should.eql( {
      fr: 'Le texte anglais est franchement nul.'
    } );

  } );

} );