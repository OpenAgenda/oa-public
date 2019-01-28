"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const generateCustomFields = require( '../server/legacy/generateCustomFields' );

describe( 'form-schemas -08_2- unit (server): generate legacy custom fields from schema', function() {

  it( 'schema to text custom field', () => {

    generateCustomFields( _get( 'text.schema' ) ).should.eql( _get( 'text.custom' ) );

  } );

  it( 'schema to number custom field', () => {

    generateCustomFields( _get( 'number.schema' ) ).should.eql( _get( 'number.custom.fromSchema' ) );

  } );

} );

function _get( name ) {

  return JSON.parse( fs.readFileSync( __dirname + '/parse/' + name + '.json', 'utf-8' ) );

}
