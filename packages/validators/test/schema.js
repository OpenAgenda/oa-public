"use strict";

require('source-map-support').install();

const validators = require( './build' ),

schema = require( './build/schema' ),

should = require( 'should' ),

utils = require( 'utils' );

describe( 'schema validator', () => {

  describe( 'basic', () => {

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
    

    it( 'validates a subset of the schema', () => {

      let clean = schemaValidator.part( [ 'url', 'settings.someSetting' ], {
        url: 'https://openagenda.com',
        settings: {
          someSetting: 12
        }
      } );

      clean.should.eql( {
        url: 'https://openagenda.com',
        settings: {
          someSetting: 12
        }
      } );

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


  describe( 'deep schemas', () => {

    let schemaValidator;

    before( () => {

      schema.register( {
        text: validators.text,
        link: validators.link,
        number: validators.number,
        boolean: validators.boolean
      } );

      schemaValidator = schema( {
        title: { 
          type: 'text', 
          min: 2, 
          max: 255, 
          optional: false
        },
        description: {
          type: 'text',
          max: 40
        },
        image: {
          type: 'text'
        },
        url: {
          type: 'link'
        },
        settings: {
          credentials: {
            moderators: {
              type: 'boolean',
              default: false
            },
            universe: {
              type: 'number',
              default: 42
            }
          }
        }
      } );

    } );


    it( 'valid deep object is valid', () => {

      let cleanObject = schemaValidator( {
        title: 'Puma',
        description: 'A feline',
        url: 'https://openagenda.com',
        settings: {
          credentials: {
            moderators: true
          }
        }
      } );

      cleanObject.should.eql( {
        title: 'Puma',
        description: 'A feline',
        url: 'https://openagenda.com',
        image: null,
        settings: {
          credentials: {
            moderators: true,
            universe: 42
          }
        }
      } );

    } );


    it( 'invalid deep object gives flat', () => {

      let errors;

      try {
        
        let cleanObject = schemaValidator( {
          description: 'P',
          url: 'notalink',
          settings: {
            credentials: {
              universe: 'here'
            }
          }
        } );

      } catch( e ) {

        errors = e;

      }

      errors.should.eql( [ {
        field: 'title',
        code: 'string.tooshort',
        message: 'the string is too short',
        values: { min: 2, max: 255 },
        origin: undefined 
      }, {
        field: 'url',
        code: 'link.invalid',
        message: 'value is not a link',
        origin: 'notalink'
      },{
        field: 'settings.credentials.universe',
        code: 'number.invalid',
        message: 'not a number',
        origin: 'here'
      } ] );

    } );

  } );


} );