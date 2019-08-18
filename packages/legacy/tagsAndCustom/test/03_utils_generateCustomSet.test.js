"use strict";

const fs = require( 'fs' );
const should = require( 'should' );

const generateCustomFields = require( '../lib/utils/generateCustomSet' );

describe( '03 - utils - generateCustomSet', () => {

  it( 'schema to text custom field', () => {
    generateCustomFields(
      _get( 'schemas/text.json' )
    ).customFields.should.eql(
      _get( 'customSets/text.json' )
    );
  } );

  it( 'schema to number custom field', () => {
    generateCustomFields(
      _get( 'schemas/number.json' )
    ).customFields.should.eql(
      _get( 'customSets/number.json' )
    );
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

function _get( fixtureFile ) {
  return JSON.parse( fs.readFileSync( `${__dirname}/fixtures/${fixtureFile}`, 'utf-8' ) );
}

