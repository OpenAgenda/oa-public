"use strict";

const _ = require( 'lodash' );
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
        display: true,
        min: null,
        max: null,
        sub: null,
        help: null,
        helpLink: null,
        helpContent: null,
        fieldType: 'text',
        origin: null,
        enableWith : null,
        related: [],
        default: undefined
      } );

    } );

    it( 'field labels can be strings', () => {

      iso.validateField( {
        field: 'atextfield',
        fieldType: 'text',
        label: 'Un champ texte'
      } ).label.should.equal( 'Un champ texte' );

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
        sub: null,
        help : null,
        helpLink : null,
        helpContent: null,
        write: null,
        read: null,
        optional: true,
        display: true,
        origin: null,
        languages: [ 'fr', 'en', 'it' ],
        min: null,
        max: null,
        fieldType: 'text' ,
        enableWith : null,
        related: [],
        default: undefined
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
        sub: null,
        help : null,
        helpLink : null,
        helpContent: null,
        read: null,
        write: null,
        optional: true,
        display: true,
        options: [
          { id: null, legacyId: null, value: '1', label: { fr: 'Un' } },
          { id: null, legacyId: null, value: '2', label: { fr: 'Deux' } }
        ],
        fieldType: 'radio',
        origin: null,
        enableWith : null,
        related: [],
        default: undefined
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
        sub: null,
        help : null,
        helpLink : null,
        helpContent: null,
        read: null,
        write: null,
        optional: true,
        display: true,
        min: 3,
        max: 10,
        fieldType: 'textarea',
        origin: null,
        enableWith : null,
        related: [],
        default: undefined
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
        help : null,
        helpLink : null,
        helpContent: null,
        write: null,
        read: null,
        optional: true,
        display: true,
        origin: null,
        fieldType: 'someCustomType',
        min: null,
        max: null,
        enableWith : null,
        related: [],
        default: undefined
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


    it( 'abstract fields do not have required values', () => {

      iso.validateField( {
        field: 'afield',
        fieldType: 'abstract',
        optional: false
      } ).should.eql( {
        field: 'afield',
        optional: false,
        fieldType: 'abstract'
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
        label: 'A label',
        info: null,
        sub: null,
        placeholder: null,
        help : null,
        helpLink : null,
        helpContent: null,
        write: null,
        read: null,
        optional: true,
        display: true,
        origin: null,
        enableWith: 'anotherfield',
        related: [ 'anotherfield' ],
        min: null,
        max: null,
        fieldType: 'text' ,
        default: undefined
      } );

    } );

  } );

  describe( 'read and write field values', () => {

    it( 'defaults are null', () => {

      _.pick( iso.validateField( {
        field: 'afield',
        fieldType: 'text',
        label: 'A label',
      } ), [ 'write', 'read' ] ).should.eql( {
        read: null,
        write: null
      } );

    } );

    it( 'multiple values can be specified', () => {

      iso.validateField( {
        field: 'f',
        fieldType: 'text',
        label: 'alabel',
        read: [ 'steve', 'janine' ]
      } ).read.should.eql( [ 'steve', 'janine' ] );

    } );

  } );

} );
