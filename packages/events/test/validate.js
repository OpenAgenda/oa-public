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
      ownerUid: null,
      title: {
        fr: 'Un titre'
      },
      description: {},
      longDescription: {},
      keywords: {},
      conditions: {},
      accessibility: {
        hi: false,
        mi: false,
        pi: false,
        sl: false,
        vi: false
      },
      image: {
        filename: null,
        credits: null,
        size: {
          height: null,
          width: null
        },
        variants: []
      },
      registration: [],
      timezone: 'Europe/Paris',
      locationUid: null,
      private: false,
      timings: [],
      draft: true,
      age: {
        min: null,
        max: null
      },
      updatedAt: undefined,
      createdAt: undefined,
      deletedAt: undefined
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
      conditions: {},
      keywords: {},
      accessibility: {
        hi: false,
        mi: false,
        pi: false,
        sl: false,
        vi: false
      },
      draft: true,
      timings: [],
      registration: [],
      age: {
        min: null,
        max: null
      },
      image: {
        credits: null,
        filename: null,
        size: {
          height: null,
          width: null
        },
        variants: []
      },
      timezone: 'Europe/Paris',
      updatedAt: undefined,
      createdAt: undefined
    } );

  } );

} );