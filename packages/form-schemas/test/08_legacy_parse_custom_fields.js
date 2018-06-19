"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const parseCustomFields = require( '../server/legacy/parseCustomFields' );


describe( 'form-schemas - unit (server): legacy custom fields', function() {

  it( 'takes a form schema, a custom field set with one text field, gives the form schema completed with the text field', () => {

    parseCustomFields( { fields: [] }, _get( 'text.in' ) )

      .should.eql( _get( 'text.out' ) );

  } );

  it( 'number field', () => {

    parseCustomFields( { fields: [] }, _get( 'number.in' ) )

      .should.eql( _get( 'number.out' ) );

  } );

  it( 'integer field', () => {

    parseCustomFields( { fields: [] }, _get( 'integer.in' ) )

      .should.eql( _get( 'customInteger.out' ) );

  } );

  it( 'textarea field', () => {


  } );

  it( 'radio field', () => {

    parseCustomFields( { fields: [] }, _get( 'radio.in' ) ).should.eql( _get( 'radio.out' ) );

  } );

  it( 'multichoice field', () => {

    parseCustomFields( { fields: [] }, _get( 'multichoice.in' ) ).should.eql( _get( 'checkbox.out' ) );

  } );

  it( 'select field', () => {

    parseCustomFields( { fields: [] }, _get( 'select.in' ) ).should.eql( _get( 'select.out' ) );

  } );

} );

function _get( name ) {

  return JSON.parse( fs.readFileSync( __dirname + '/parse/' + name + '.json', 'utf-8' ) );

}