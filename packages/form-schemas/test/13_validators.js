"use strict";

const fs = require( 'fs' );
const should = require( 'should' );

const getValidatorFromField = require( '../iso/getValidatorFromField' );
const getSchema = require( '../iso/getSchema' );

describe( 'deriving validators', () => {

  it( 'text field to validator', () => {

    getValidatorFromField( _get( 'text.field' ) ).should.eql( _get( 'text.validator' ) );

  } );

  it( 'radio field to choice validator', () => {

    getValidatorFromField( _get( 'radio.field' ) ).should.eql( _get( 'radio.validator' ) );

  } );

  it( 'integer field to validator', () => {

    getValidatorFromField( _get( 'integer.field' ) ).should.eql( _get( 'integer.validator' ) );

  } );

  it( 'select field to choice validator', () => {

    getValidatorFromField( _get( 'select.field' ) ).should.eql( _get( 'select.validator' ) );

  } );

  it( 'number field to validator', () => {

    getValidatorFromField( _get( 'number.field' ) ).should.eql( _get( 'number.validator' ) );

  } );

  it( 'multilingual text field to multilingual validator', () => {

    getValidatorFromField( _get( 'multilingualText.field' ) ).should.eql( _get( 'multilingual.validator' ) );

  } );

  it( 'multilingual textarea field to multilingual validator', () => {

    getValidatorFromField( _get( 'multilingualTextarea.field' ) ).should.eql( _get( 'multilingual.validator' ) );

  } );


  it( 'FormSchema getSchema takes into account enableWith when defined', () => {

    const fields = [ {
      field: 'image',
      label: 'Champ image',
      fieldType: 'text'
    }, {
      field: 'imageCredits',
      label: 'Crédits image',
      fieldType: 'text',
      enableWith: 'image',
      optional: false
    } ];

    const s = getSchema( fields );

    let errored = false;

    try {

      s();

    } catch ( e ) {

      console.log( e );

      errored = true;

    }

    errored.should.equal( false );

  } );

  it( 'getSchema ignores abstract fields', () => {

    const s = getSchema( [ {
      field: 'atextfield',
      label: { fr: 'Un champ texte' },
      fieldType: 'abstract'
    }, {
      field: 'anotherfield',
      label: { fr: 'Un nombre' },
      fieldType: 'number',
      min: 2
    } ] );

    const clean = s( {
      atextfield: 'Some text',
      anotherfield: 13
    } );

    clean.should.eql( {
      anotherfield: 13
    } );

  } )


  it( 'FormSchema builds a schema based on list of field configurations', () => {

    const fields = [ {
      field: 'atextfield',
      label: { fr: 'Un champ texte' },
      fieldType: 'text'
    }, {
      field: 'anotherfield',
      label: { fr: 'Un nombre' },
      fieldType: 'number',
      default: 13,
      min: 2
    }, {
      field: 'andanotherfield',
      label: {
        fr: 'Un choix'
      },
      fieldType: 'radio',
      options: [ {
        id: 1,
        value: 'option-1',
        label: { fr: 'Option 1' }
      }, {
        id: 2,
        value: 'option-2',
        label: { fr: 'Option 2' }
      } ]
    } ];

    const s = getSchema( fields );

    const clean = s( {
      atextfield: 'Some text',
      andanotherfield: 1
    } );

    clean.should.eql( {
      atextfield: 'Some text',
      anotherfield: 13,
      andanotherfield: 1
    } );

  } );

} );

function _get( name ) {

  return JSON.parse( fs.readFileSync( __dirname + '/parse/' + name + '.json', 'utf-8' ) );

}
