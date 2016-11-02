"use strict";

const should = require( 'should' );
const validate = require( '../service/validate' );
const frontValidate = require( '../service/validate/front' );

describe( 'event validation', () => {

  it( 'full validation only needs identifier fields and title to be informed to declare an event valid', () => {

    let clean, errors = [];

    try {

      clean = validate( {
        id: 1,
        uid: 123,
        slug: 'a-slug',
        title: {
          fr: 'Un titre'
        },
        timings: []
      } )
      
    } catch ( e ) {

      errors = e;

    }

    errors.length.should.equal( 0 );

    clean.should.eql( {
      id: 1,
      uid: 123,
      slug: 'a-slug',
      agendaUid: null,
      ownerId: null,
      title: {
        fr: 'Un titre'
      },
      description: {},
      longDescription: {},
      keywords: {},
      image: null,
      locationUid: null,
      private: false,
      timings: [],
      draft: true,
      age: {
        min: null,
        max: null
      }
    } );

  } );

  it( 'public validation only needs title', () => {

    let clean, errors = [];

    try {

      clean = frontValidate( {
        slug: 'un-titre',
        title: {
          fr: 'Un titre'
        },
        timings: []
      } );

    } catch( e ) {

      errors = e;

    }

    errors.length.should.equal( 0 );

    clean.should.eql( { 
      slug: 'un-titre',
      locationUid: null,
      title: {
        fr: 'Un titre'
      },
      description: {},
      longDescription: {},
      keywords: {},
      draft: true,
      timings: [],
      age: {
        min: null,
        max: null
      }
    } );

  } );

} );