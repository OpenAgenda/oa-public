"use strict";

require('source-map-support').install();

const validators = require( '../' ),

schema = require( './build/schema' ),

should = require( 'should' ),

utils = require( 'utils' );

describe( 'schema validator', () => {

  let schemaValidator;

  before( () => {

    // load up the validators
    // that will be used by the schema lib
    schema.register( {
      text: validators.text,
      link: validators.link,
      number: validators.number
    } );

    // define the schema

    schemaValidator = schema( {
      title: {
        type: 'text',
        min: 2,
        max: 100
      },
      url: {
        type: 'link'
      },
      settings: {
        someSetting: {
          type: 'number'
        }
      }
    } );

  } );

  it( 'validates and cleans a value based on defined schema', () => {

    let clean = schemaValidator( {
      title: 'Lunettes, plutot sage',
      url: 'https://openagenda.com',
      settings: {
        someSetting: '42'
      }
    } );

    clean.should.eql( {
      title: 'Lunettes, plutot sage',
      url: 'https://openagenda.com',
      settings: {
        someSetting: 42 
      }
    } );

  } );


  it( 'validates and cleans a part of the schema', () => {

    let clean = schemaValidator.part( 'url', 'https://openagenda.com' );

    clean.should.equal( 'https://openagenda.com' );

  } );

  it( 'validates and cleans a deeper part of the schema', () => {

    let clean = schemaValidator.part( 'settings.someSetting', '12' );

    clean.should.equal( 12 );

  } );


  it( 'validates and cleans a part of the schema - object case', () => {

    let clean = schemaValidator.part( 'settings', {
      someSetting: 45
    } );

    clean.should.eql( {
      someSetting: 45
    } );

  } );


  it( 'filters out any value not part of the original schema', () => {

    let clean = schemaValidator( {
      title: 'the title',
      url: 'https://openagenda.com',
      settings: {
        someSetting: '23'
      },
      ignoredValue: 'fdsfds'
    } );

    clean.should.eql( {
      title: 'the title',
      url: 'https://openagenda.com',
      settings: {
        someSetting: 23
      }
    } );

  } );

} );