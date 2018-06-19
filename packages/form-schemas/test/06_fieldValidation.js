"use strict";

const iso = require( '../iso' );

const should = require( 'should' );

describe( 'field validation', () => {

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
        fieldType: 'text',
        origin: null
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
        origin: null
      } );

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
        "placeholder" : null,
        read: null,
        write: null,
        optional: true,
        min: 3,
        max: 10,
        fieldType: 'textarea',
        origin: null
      } );

    } );

  } );

} );