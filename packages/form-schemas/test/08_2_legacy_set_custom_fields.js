"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const generateCustomFields = require( '../server/legacy/generateCustomFields' );

describe( 'form-schemas -08_2- unit (server): generate legacy custom fields from schema', function() {

  it( 'schema to text custom field', () => {

    generateCustomFields( _get( 'text.schema' ) ).customFields.should.eql( _get( 'text.custom' ) );

  } );

  it( 'schema to number custom field', () => {

    generateCustomFields( _get( 'number.schema' ) ).customFields.should.eql( _get( 'number.custom.fromSchema' ) );

  } );

  it( 'if read right is administrator and moderator, custom field should be administrator', () => {

    const { customFields } = generateCustomFields( {
      fields: [ {
        field: 'Montant',
        fieldType: 'integer',
        label: 'Somme proposée à la commission',
        read : [ 'administrator', 'moderator' ],
        origin: 'custom'
      } ]
    } );

    customFields[ 0 ].type.should.equal( 'administrator' );

  } );

  it( 'if read right is administrator, moderator and contributor, custom field should be private', () => {

    const { customFields } = generateCustomFields( {
      fields: [ {
        field: 'Présentation',
        fieldType: 'file',
        extensions: [ 'pdf' ],
        read : [ 'administrator', 'moderator', 'contributor' ],
        label: 'Vous pouvez également charger ici une présentation de votre événement, elle ne sera visible que des délégations et pas du grand public.',
        origin: 'custom'
      } ]
    } );

    customFields[ 0 ].type.should.equal( 'private' );

  } );

} );

function _get( name ) {

  return JSON.parse( fs.readFileSync( __dirname + '/parse/' + name + '.json', 'utf-8' ) );

}
