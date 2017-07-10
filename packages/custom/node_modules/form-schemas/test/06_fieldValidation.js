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
        read: null,
        write: null,
        optional: true,
        min: null,
        max: null,
        fieldType: 'text' 
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
        } ]
      } )

      .should.eql( {
        field: 'anoptionlist',
        label: { fr: 'Choix multiples' },
        info: null,
        read: null,
        write: null,
        optional: true,
        options: [
          { id: null, legacyId: null, value: '1', label: { fr: 'Un' } },
          { id: null, legacyId: null, value: '2', label: { fr: 'Deux' } } 
        ],
        fieldType: 'radio'
      } );

    } );


    it( 'validates a text field that includes min and max', () => {

      iso.validateField( {
        field: 'atextfield',
        fieldType: 'textarea',
        label: { fr: 'Un champ de texte libre' },
        info: { fr: 'Avec un détail explicatif' },
        min: 3,
        max: 10
      } )

      .should.eql( { 
        field: 'atextfield',
        label: { fr: 'Un champ de texte libre' },
        info: { fr: 'Avec un détail explicatif' },
        read: null,
        write: null,
        optional: true,
        min: 3,
        max: 10,
        fieldType: 'textarea'
      } );

    } );

  } );

} );