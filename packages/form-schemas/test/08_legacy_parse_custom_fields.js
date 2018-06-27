"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const parseCustomFields = require( '../server/legacy/parseCustomFields' );

describe( 'form-schemas - unit (server): legacy custom fields', function() {

  it( 'text custom field to schema', () => {

    parseCustomFields( { fields: [] }, _get( 'text.custom' ) )

      .should.eql( _get( 'text.schema' ) );

  } );

  it( 'number custom field to schema', () => {

    parseCustomFields( { fields: [] }, _get( 'number.custom' ) )

      .should.eql( _get( 'number.schema' ) );

  } );

  it( 'integer custom field to schema', () => {

    parseCustomFields( { fields: [] }, _get( 'integer.custom' ) )

      .should.eql( _get( 'integer.schema' ) );

  } );

  it( 'radio custom field to schema', () => {

    parseCustomFields( { fields: [] }, _get( 'radio.custom' ) ).should.eql( _get( 'radio.schema' ) );

  } );

  it( 'multichoice custom field to schema', () => {

    parseCustomFields( { fields: [] }, _get( 'multichoice.in' ) ).should.eql( _get( 'checkbox.schema' ) );

  } );

  it( 'select custom field to schema', () => {

    parseCustomFields( { fields: [] }, _get( 'select.custom' ) ).should.eql( _get( 'select.schema' ) );

  } );

} );

function _get( name ) {

  return JSON.parse( fs.readFileSync( __dirname + '/parse/' + name + '.json', 'utf-8' ) );

}