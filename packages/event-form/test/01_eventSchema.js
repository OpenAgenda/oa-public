"use strict";

const _ = require( 'lodash' );

const eventSchema = require( '../src/schema' );

describe( 'event-form eventSchema', () => {

  test( 'languages set to true equates no languages', () => {

    const es = eventSchema( {
      languages: true
    } );

    expect(
      es.fields.filter( f => f.field === 'description' )[ 0 ].languages
    ).toEqual( [] );


  } );

  test( 'null languages are filtered out', () => {

    const es = eventSchema( {
      languages: [ null ], // last time I checked, null is not a language.
      schemaExtensions: [ {
        fields: [ {
          field: 'description',
          fieldType: 'abstract',
          default: {
            fr: 'Une desc',
            en: 'A desc'
          }
        } ]
      } ]
    } );
    
    expect(
      es.fields.filter( f => f.field === 'description' )[ 0 ].languages
    ).toEqual( [] );

  } );

  test( 'event schema fields can be excluded altogether', () => {

    const es = eventSchema( {
      excludeEventFields: true,
      schemaExtensions: [ {
        fields: [ {
          field: 'title',
          fieldType: 'abstract',
          label: 'Nom de l\'événement'
        }, {
          field: 'exhibitors',
          fieldType: 'integer',
          label: 'Exposants'
        } ]
      } ]
    } );

    expect( es.fields.map( f => f.field ) ).toEqual( [
      'exhibitors'
    ] );

  } );

  test( 'event schema generator requires languages to be specified for multilingual fields', () => {

    const es = eventSchema( {
      languages: [ 'fr', 'en' ]
    } );

    const multilingualFields = es.fields
      .filter( f => f.languages )
      .map( f => _.pick( f, [ 'languages', 'field' ] ) );

    expect( multilingualFields ).toEqual( [ {
      languages: [ 'fr', 'en' ],
      field: 'title' 
    }, {
      languages: [ 'fr', 'en' ],
      field: 'description'
    }, {
      languages: [ 'fr', 'en' ],
      field: 'keywords'
    }, { 
      languages: [ 'fr', 'en' ],
      field: 'longDescription'
    }, {
      languages: [ 'fr', 'en' ],
      field: 'conditions' 
    } ] );

  } );

} );
