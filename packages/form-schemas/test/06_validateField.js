"use strict";

const should = require( 'should' );

const iso = require( '../iso' );

const customValidator = require( './custom/wigglypoof.validator.js' );

describe( 'form-schemas -06- validateField', () => {

  describe( 'simple cases', () => {

    it( 'validates a text field definition', () => {

      iso.validateField( {
        field: 'atextfield',
        fieldType: 'text',
        label: {
          fr: 'Un champ texte'
        }
      } )

      .should.eql( {
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        info: null,
        placeholder: null,
        read: null,
        write: null,
        optional: true,
        min: null,
        max: null,
        sub: null,
        fieldType: 'text',
        origin: null,
        enableWith : null,
        related: []
      } );
        
    } );

    it( 'validates a multilingual text field definition', () => {

      iso.validateField( {
        field: 'amultilingualtextfield',
        fieldType: 'text',
        languages: [ 'fr', 'en', 'it' ],
        label: {
          fr: 'Un champ texte multilingue'
        }
      } )

      .should.eql( {
        field: 'amultilingualtextfield',
        label: { fr: 'Un champ texte multilingue' },
        info: null,
        placeholder: null,
        write: null,
        read: null,
        optional: true,
        origin: null,
        languages: [ 'fr', 'en', 'it' ],
        min: null,
        max: null,
        sub: null,
        fieldType: 'text' ,
        enableWith : null,
        related: []
      } );

    } );

    it( 'validates a radio field definition', () => {
      
      iso.validateField( {
        field: 'anoptionlist',
        fieldType: 'radio',
        label: { fr: 'Choix multiples' },
        options: [ {
          value: 1,
          label: { fr: 'Un' }
        }, {
          value: 2,
          label: { fr: 'Deux' }
        } ],
        origin: null
      } )

      .should.eql( {
        field: 'anoptionlist',
        label: { fr: 'Choix multiples' },
        info: null,
        placeholder: null,
        read: null,
        write: null,
        optional: true,
        options: [
          { id: null, legacyId: null, value: '1', label: { fr: 'Un' } },
          { id: null, legacyId: null, value: '2', label: { fr: 'Deux' } } 
        ],
        fieldType: 'radio',
        sub: null,
        origin: null,
        enableWith : null,
        related: []
      } );

    } );


    it( 'radio field definition can be monolingual', () => {

      iso.validateField( {
        field: 'anoptionlist',
        fieldType: 'radio',
        label: 'Choix multiples',
        options: [ {
          id: 1,
          value: '1',
          label: 'Un'
        }, {
          id: 2,
          value: '2',
          label: 'Deux'
        } ],
        origin: null
      } ).options.should.eql( [ {
          id: 1,
          value: '1',
          legacyId: null,
          label: { en: 'Un' }
        }, {
          id: 2,
          value: '2',
          legacyId: null,
          label: { en: 'Deux' }
        } ] );

    } );


    it( 'validates a text field that includes min and max', () => {

      iso.validateField( {
        field: 'atextfield',
        fieldType: 'textarea',
        label: { fr: 'Un champ de texte libre' },
        info: { fr: 'Avec un détail explicatif' },
        min: 3,
        max: 10,
        origin: null
      } )

      .should.eql( { 
        field: 'atextfield',
        label: { fr: 'Un champ de texte libre' },
        info: { fr: 'Avec un détail explicatif' },
        placeholder : null,
        read: null,
        write: null,
        optional: true,
        min: 3,
        max: 10,
        fieldType: 'textarea',
        sub: null,
        origin: null,
        enableWith : null,
        related: []
      } );

    } );


    it( 'validate a field requiring a custom validator', () => {

      iso.validateField( {
        field: 'acustomfield',
        fieldType: 'someCustomType',
        label: {
          fr: 'Un champ au type personnalisé'
        }
      }, {
        custom: {
          someCustomType: customValidator
        }
      } ).should.eql( {
        field: 'acustomfield',
        label: { fr: 'Un champ au type personnalisé' },
        info: null,
        placeholder: null,
        sub: null,
        write: null,
        read: null,
        optional: true,
        origin: null,
        fieldType: 'someCustomType',
        min: null,
        max: null,
        enableWith : null,
        related: []
      } );

    } );


    it( 'validate a field with labels specified only in one language', () => {

      iso.validateField( {
        field: 'afield',
        fieldType: 'text',
        label: 'A monolingual label',
      }, { defaultLabelLanguage: 'fr' } ).label
      .should.eql( {
        fr: 'A monolingual label'
      } );

    } );


    it( 'a field with an enableWith value set will have the value added to the related fields list', () => {

      iso.validateField( {
        field: 'afield',
        fieldType: 'text',
        label: 'A label',
        enableWith: 'anotherfield'
      } ).should.eql( { 
        field: 'afield',
        label: { en: 'A label' },
        info: null,
        sub: null,
        placeholder: null,
        write: null,
        read: null,
        optional: true,
        origin: null,
        enableWith: 'anotherfield',
        related: [ 'anotherfield' ],
        min: null,
        max: null,
        fieldType: 'text' 
      } );

    } );
    

  } );

} );
